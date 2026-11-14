import { Lead } from '../../models/Lead.js';
import { Property } from '../../models/Property.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Booking } from '../../models/Booking.js';
import { Task } from '../../models/Task.js';
import { Employee } from '../../models/Employee.js';
import { successResponse, errorResponse } from '../../utils/response.js';
// Sanitize fields against Spreadsheet Formula Injection (CSV injection)
const sanitizeCsvCell = (val) => {
    if (val === null || val === undefined)
        return '';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};
export const getReportsSummary = async (req, res) => {
    try {
        const [leadsBySource, leadsByStage, employees, siteVisitOutcomes, propertyInventory, bookingCollections, overdueTasks,] = await Promise.all([
            Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
            Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 }, totalOffer: { $sum: '$offerAmount' } } }]),
            Employee.find({ isActive: true }).select('name role activeLeadsCount totalClosedDeals assignedDistricts'),
            SiteVisit.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Property.aggregate([{ $group: { _id: '$category', total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } }]),
            Booking.aggregate([
                {
                    $group: {
                        _id: '$paymentStatus',
                        totalTokenAmount: { $sum: '$tokenAmount' },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Task.countDocuments({ status: { $in: ['pending', 'in-progress'] }, dueDate: { $lt: new Date() } }),
        ]);
        successResponse(res, {
            leadsBySource,
            leadsByStage,
            employees,
            siteVisitOutcomes,
            propertyInventory,
            bookingCollections,
            overdueTasks,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const exportCsvReport = async (req, res) => {
    try {
        const { type = 'leads' } = req.query;
        let filename = `report_${type}_${Date.now()}.csv`;
        let headers = [];
        let rows = [];
        if (type === 'leads') {
            const leads = await Lead.find().sort({ createdAt: -1 });
            headers = ['Lead ID', 'Buyer Name', 'Phone', 'Email', 'Property Title', 'Stage', 'Priority', 'Assigned Executive', 'Offer Amount (INR)', 'Created Date'];
            rows = leads.map((l) => [
                sanitizeCsvCell(l.referenceId),
                sanitizeCsvCell(l.buyerName),
                sanitizeCsvCell(l.phone),
                sanitizeCsvCell(l.email),
                sanitizeCsvCell(l.propertyTitle),
                sanitizeCsvCell(l.stage),
                sanitizeCsvCell(l.priority),
                sanitizeCsvCell(l.assignedEmployeeId),
                sanitizeCsvCell(l.offerAmount || 0),
                sanitizeCsvCell(l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : ''),
            ]);
        }
        else if (type === 'properties') {
            const properties = await Property.find().sort({ createdAt: -1 });
            headers = ['Reference ID', 'Title', 'Category', 'District', 'Locality', 'Price (INR)', 'Plot Area', 'Unit', 'Status', 'Verified', 'Approval'];
            rows = properties.map((p) => [
                sanitizeCsvCell(p.referenceId),
                sanitizeCsvCell(p.title),
                sanitizeCsvCell(p.category),
                sanitizeCsvCell(p.district),
                sanitizeCsvCell(p.locality),
                sanitizeCsvCell(p.price),
                sanitizeCsvCell(p.plotArea),
                sanitizeCsvCell(p.plotAreaUnit),
                sanitizeCsvCell(p.status),
                sanitizeCsvCell(p.verified ? 'Yes' : 'No'),
                sanitizeCsvCell(p.approvalAuthority || 'None'),
            ]);
        }
        else if (type === 'bookings') {
            const bookings = await Booking.find().sort({ createdAt: -1 });
            headers = ['Booking Number', 'Property Title', 'Customer Name', 'Token Amount (INR)', 'Total Amount (INR)', 'Payment Status', 'Booking Status', 'Date'];
            rows = bookings.map((b) => [
                sanitizeCsvCell(b.bookingNumber),
                sanitizeCsvCell(b.propertyTitle),
                sanitizeCsvCell(b.customerName),
                sanitizeCsvCell(b.tokenAmount),
                sanitizeCsvCell(b.totalAmount),
                sanitizeCsvCell(b.paymentStatus),
                sanitizeCsvCell(b.status || b.bookingStatus || 'draft'),
                sanitizeCsvCell(b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : b.bookingDate),
            ]);
        }
        else if (type === 'visits') {
            const visits = await SiteVisit.find().sort({ createdAt: -1 });
            headers = ['Visit ID', 'Customer Name', 'Customer Phone', 'Property Title', 'Executive', 'Date', 'Time Slot', 'Status'];
            rows = visits.map((v) => [
                sanitizeCsvCell(v.referenceId),
                sanitizeCsvCell(v.customerName),
                sanitizeCsvCell(v.customerPhone),
                sanitizeCsvCell(v.propertyTitle),
                sanitizeCsvCell(v.assignedEmployeeId),
                sanitizeCsvCell(v.date),
                sanitizeCsvCell(v.timeSlot),
                sanitizeCsvCell(v.status),
            ]);
        }
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send('\uFEFF' + csvContent); // BOM for Excel UTF-8 compatibility
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
