import { Booking } from '../../models/Booking.js';
import { Property } from '../../models/Property.js';
import { Lead } from '../../models/Lead.js';
import { Activity } from '../../models/Activity.js';
import { Notification } from '../../models/Notification.js';
import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getBookings = async (req, res) => {
    try {
        const { status, includeSample } = req.query;
        const filter = {};
        if (includeSample !== 'true') {
            filter.isSample = { $ne: true };
        }
        if (status && status !== 'all')
            filter.status = status;
        // Sales Executive ownership isolation
        const userRole = req.user?.role;
        const userId = req.user?.userId;
        if (userRole === 'sales-executive' && userId) {
            filter.$or = [
                { assignedEmployeeId: userId },
                { assignedEmployee: userId },
            ];
        }
        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .populate('property')
            .populate('assignedEmployee');
        successResponse(res, bookings);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const createBooking = async (req, res) => {
    try {
        const data = req.body;
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const bookingNumber = data.bookingNumber || `GG-BKG-2026-${randomSuffix}`;
        const referenceId = data.referenceId || `book-${Date.now()}`;
        // Business Rule: Booking creation begins with pending payment status
        const newBooking = await Booking.create({
            ...data,
            bookingNumber,
            referenceId,
            status: data.status || 'token-received',
            paymentStatus: 'pending', // Initial state: pending genuine server-side verification
        });
        // Business Rule: Update Property to under-negotiation and reserved
        if (data.propertyId) {
            await Property.findOneAndUpdate({
                $or: [
                    { referenceId: data.propertyId },
                    ...(data.propertyId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: data.propertyId }] : []),
                ],
            }, { status: 'under-negotiation', availability: 'reserved' });
        }
        // Update Lead to won
        if (data.leadId) {
            await Lead.findOneAndUpdate({ referenceId: data.leadId }, { stage: 'won' });
        }
        // Business Rule: Activity record creation
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'booking',
            entityId: newBooking.referenceId,
            type: 'token',
            title: 'Booking Created (Payment Pending Verification)',
            description: `Booking #${newBooking.bookingNumber} created for ${newBooking.propertyTitle} with token ₹${newBooking.tokenAmount.toLocaleString('en-IN')}`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'Accounts & Legal Desk',
        });
        await Notification.create({
            referenceId: `notif-${Date.now()}`,
            title: 'New Booking Created',
            message: `Booking #${newBooking.bookingNumber} registered for ${newBooking.propertyTitle}`,
            type: 'booking',
            read: false,
            timestamp: new Date().toISOString(),
            actionView: 'seller-dashboard',
        });
        successResponse(res, newBooking, 'Booking created successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionRef, amount, paymentMethod } = req.body;
        if (!transactionRef) {
            errorResponse(res, 'Transaction reference is required for payment verification', 400);
            return;
        }
        const booking = await Booking.findOne({
            $or: [
                { bookingNumber: id },
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!booking) {
            errorResponse(res, 'Booking not found', 404);
            return;
        }
        booking.paymentStatus = 'paid';
        booking.transactionRef = transactionRef;
        if (paymentMethod)
            booking.paymentMethod = paymentMethod;
        if (amount)
            booking.tokenAmount = amount;
        await booking.save();
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'booking',
            entityId: booking.referenceId,
            type: 'token',
            title: 'Payment Verified & Cleared',
            description: `Payment for Booking #${booking.bookingNumber} verified (Ref: ${transactionRef}, Amount: ₹${booking.tokenAmount.toLocaleString('en-IN')})`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'Accounts & Finance Desk',
        });
        successResponse(res, booking, 'Payment verified and cleared successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const existing = await Booking.findOne({
            $or: [
                { bookingNumber: id },
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!existing) {
            errorResponse(res, 'Booking not found', 404);
            return;
        }
        // Sales Executive ownership check
        if (req.user?.role === 'sales-executive') {
            const isOwner = existing.assignedEmployeeId === req.user.userId || (existing.assignedEmployee && existing.assignedEmployee.toString() === req.user.userId);
            if (!isOwner) {
                errorResponse(res, 'Access Denied: You cannot modify another executive\'s booking.', 403);
                return;
            }
        }
        const previousPaymentStatus = existing.paymentStatus;
        const booking = await Booking.findOneAndUpdate({ _id: existing._id }, updates, { new: true });
        if (!booking) {
            errorResponse(res, 'Booking not found', 404);
            return;
        }
        // Audit Log for manual payment corrections
        if (updates.paymentStatus && updates.paymentStatus !== previousPaymentStatus) {
            await AuditLog.create({
                user: req.user?.userId ? req.user.userId : undefined,
                userEmail: req.user?.email,
                action: 'PAYMENT_STATUS_ADJUSTED',
                module: 'BOOKINGS',
                entityId: booking.referenceId,
                changes: {
                    previousPaymentStatus,
                    newPaymentStatus: updates.paymentStatus,
                    notes: updates.notes,
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
        }
        // Business Rule: If registered, mark property as sold and unavailable
        if (updates.status === 'registered' && booking.propertyId) {
            await Property.findOneAndUpdate({
                $or: [
                    { referenceId: booking.propertyId },
                    ...(booking.propertyId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: booking.propertyId }] : []),
                ],
            }, { status: 'sold', availability: 'sold' });
        }
        // Business Rule: Activity record creation on update
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'booking',
            entityId: booking.referenceId,
            type: 'status-change',
            title: `Booking Status: ${booking.status.toUpperCase()}`,
            description: `Booking #${booking.bookingNumber} updated to status '${booking.status}'`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'Accounts & Legal Desk',
        });
        successResponse(res, booking, 'Booking updated successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
