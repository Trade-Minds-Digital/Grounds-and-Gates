import { SiteVisit } from '../../models/SiteVisit.js';
import { Lead } from '../../models/Lead.js';
import { Activity } from '../../models/Activity.js';
import { Notification } from '../../models/Notification.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getSiteVisits = async (req, res) => {
    try {
        const { status, date, assignedEmployeeId, includeSample } = req.query;
        const filter = {};
        if (includeSample !== 'true') {
            filter.isSample = { $ne: true };
        }
        if (status && status !== 'all')
            filter.status = status;
        if (date)
            filter.date = date;
        // Sales Executive ownership isolation: Only see assigned visits
        const userRole = req.user?.role;
        const userId = req.user?.userId;
        if (userRole === 'sales-executive' && userId) {
            filter.$or = [
                { assignedEmployeeId: userId },
                { assignedEmployee: userId },
            ];
        }
        else if (assignedEmployeeId) {
            filter.assignedEmployeeId = assignedEmployeeId;
        }
        const visits = await SiteVisit.find(filter)
            .sort({ date: -1 })
            .populate('property')
            .populate('assignedEmployee');
        successResponse(res, visits);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const scheduleSiteVisit = async (req, res) => {
    try {
        const data = req.body;
        const referenceId = data.referenceId || `visit-${Date.now()}`;
        const newVisit = await SiteVisit.create({
            ...data,
            referenceId,
            status: 'scheduled',
        });
        // If lead exists, update lead stage
        if (data.leadId) {
            await Lead.findOneAndUpdate({ referenceId: data.leadId }, { stage: 'scheduled', scheduledVisitDate: new Date(data.date) });
        }
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'site-visit',
            entityId: newVisit.referenceId,
            type: 'site-visit',
            title: 'Site Visit Confirmed',
            description: `Appointment scheduled for ${newVisit.customerName} on ${newVisit.date} (${newVisit.timeSlot}).`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'Executive Desk',
        });
        await Notification.create({
            referenceId: `notif-${Date.now()}`,
            title: 'Site Visit Scheduled',
            message: `${newVisit.customerName} booked walkthrough for ${newVisit.propertyTitle}`,
            type: 'visit',
            read: false,
            timestamp: new Date().toISOString(),
            actionView: 'seller-dashboard',
        });
        successResponse(res, newVisit, 'Site visit scheduled successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateSiteVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const existing = await SiteVisit.findOne({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!existing) {
            errorResponse(res, 'Site visit not found', 404);
            return;
        }
        // Sales Executive ownership check
        if (req.user?.role === 'sales-executive') {
            const isOwner = existing.assignedEmployeeId === req.user.userId || (existing.assignedEmployee && existing.assignedEmployee.toString() === req.user.userId);
            if (!isOwner) {
                errorResponse(res, 'Access Denied: You cannot modify another executive\'s site visit.', 403);
                return;
            }
        }
        const visit = await SiteVisit.findOneAndUpdate({ _id: existing._id }, updates, { new: true });
        if (!visit) {
            errorResponse(res, 'Site visit not found', 404);
            return;
        }
        if (updates.status) {
            await Activity.create({
                referenceId: `act-${Date.now()}`,
                entityType: 'site-visit',
                entityId: visit.referenceId,
                type: 'site-visit',
                title: `Site Visit: ${updates.status.toUpperCase()}`,
                description: `Walkthrough status updated to ${updates.status}. Feedback: ${updates.feedback || 'None'}`,
                timestamp: new Date().toISOString(),
                performedBy: req.user?.email || 'System',
            });
        }
        successResponse(res, visit, 'Site visit updated successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
