import { Lead } from '../../models/Lead.js';
import { Activity } from '../../models/Activity.js';
import { Notification } from '../../models/Notification.js';
import { Employee } from '../../models/Employee.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getLeads = async (req, res) => {
    try {
        const { stage, priority, assignedEmployeeId, search, includeSample, page = '1', limit = '50' } = req.query;
        const filter = {};
        if (includeSample !== 'true') {
            filter.isSample = { $ne: true };
        }
        if (stage && stage !== 'all')
            filter.stage = stage;
        if (priority && priority !== 'all')
            filter.priority = priority;
        // Sales Executive ownership isolation: Only see assigned leads
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
        if (search) {
            const searchConditions = [
                { buyerName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { propertyTitle: { $regex: search, $options: 'i' } },
            ];
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
                delete filter.$or;
            }
            else {
                filter.$or = searchConditions;
            }
        }
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;
        const [leads, total] = await Promise.all([
            Lead.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('assignedEmployee', 'name role phone email avatarUrl'),
            Lead.countDocuments(filter),
        ]);
        successResponse(res, leads, 'Leads fetched successfully', 200, {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum) || 1,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findOne({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        }).populate('assignedEmployee');
        if (!lead) {
            errorResponse(res, 'Lead not found', 404);
            return;
        }
        // Sales Executive record ownership check: Cannot update another executive's lead
        if (req.user?.role === 'sales-executive') {
            const isOwner = lead.assignedEmployeeId === req.user.userId || (lead.assignedEmployee && lead.assignedEmployee.toString() === req.user.userId);
            if (!isOwner) {
                errorResponse(res, 'Access Denied: You cannot modify another executive\'s lead.', 403);
                return;
            }
        }
        // Sales Executive record ownership check: Cannot access another executive's lead by ID
        if (req.user?.role === 'sales-executive') {
            const isOwner = lead.assignedEmployeeId === req.user.userId || (lead.assignedEmployee && lead.assignedEmployee._id?.toString() === req.user.userId);
            if (!isOwner) {
                errorResponse(res, 'Access Denied: You do not have permission to view another executive\'s lead record.', 403);
                return;
            }
        }
        const activities = await Activity.find({
            entityType: 'lead',
            entityId: lead.referenceId,
        }).sort({ createdAt: -1 });
        successResponse(res, { lead, activities });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const createLead = async (req, res) => {
    try {
        const data = req.body;
        const referenceId = data.referenceId || `lead-${Date.now()}`;
        const lead = await Lead.create({
            ...data,
            propertyId: data.propertyId || 'prop-general',
            propertyTitle: data.propertyTitle || 'General Property Inquiry',
            referenceId,
            dateStr: data.dateStr || 'Just now',
        });
        // Automatically log activity
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'lead',
            entityId: lead.referenceId,
            type: 'status-change',
            title: 'New Lead Inbound',
            description: `Inbound inquiry logged for ${lead.buyerName} on ${lead.propertyTitle}`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'CRM Desk',
        });
        // Create system notification
        await Notification.create({
            referenceId: `notif-${Date.now()}`,
            title: 'New Lead Registered',
            message: `${lead.buyerName} enquired about ${lead.propertyTitle}`,
            type: 'lead',
            read: false,
            timestamp: new Date().toISOString(),
            actionView: 'seller-dashboard',
        });
        successResponse(res, lead, 'Lead created successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateLeadStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        const lead = await Lead.findOne({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!lead) {
            errorResponse(res, 'Lead not found', 404);
            return;
        }
        // Sales Executive record ownership check: Cannot update another executive's lead
        if (req.user?.role === 'sales-executive') {
            const isOwner = lead.assignedEmployeeId === req.user.userId || (lead.assignedEmployee && lead.assignedEmployee.toString() === req.user.userId);
            if (!isOwner) {
                errorResponse(res, 'Access Denied: You cannot modify another executive\'s lead.', 403);
                return;
            }
        }
        const oldStage = lead.stage;
        lead.stage = stage;
        await lead.save();
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'lead',
            entityId: lead.referenceId,
            type: 'status-change',
            title: `Stage Changed: ${stage.toUpperCase()}`,
            description: `Lead moved from '${oldStage}' to '${stage}'`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'Sales Specialist',
        });
        successResponse(res, lead, `Lead moved to ${stage}`);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const assignLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeId } = req.body;
        const employee = await Employee.findOne({
            $or: [
                { referenceId: employeeId },
                ...(employeeId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: employeeId }] : []),
            ],
        });
        const lead = await Lead.findOneAndUpdate({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        }, {
            assignedEmployee: employee ? employee._id : undefined,
            assignedEmployeeId: employee ? employee.referenceId : employeeId,
        }, { new: true });
        if (!lead) {
            errorResponse(res, 'Lead not found', 404);
            return;
        }
        // Sales Executive record ownership check: Cannot update another executive's lead
        if (req.user?.role === 'sales-executive') {
            const isOwner = lead.assignedEmployeeId === req.user.userId || (lead.assignedEmployee && lead.assignedEmployee.toString() === req.user.userId);
            if (!isOwner) {
                errorResponse(res, 'Access Denied: You cannot modify another executive\'s lead.', 403);
                return;
            }
        }
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'lead',
            entityId: lead.referenceId,
            type: 'status-change',
            title: 'Lead Reassigned',
            description: `Lead assigned to ${employee ? employee.name : employeeId}`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'Admin',
        });
        successResponse(res, lead, 'Lead assigned successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const checkDuplicateLead = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
        const filter = [];
        if (email && email.trim()) {
            filter.push({ email: email.toLowerCase().trim() });
        }
        if (cleanPhone && cleanPhone.length >= 7) {
            filter.push({ phone: { $regex: cleanPhone } });
        }
        if (filter.length === 0) {
            successResponse(res, { duplicates: [], hasDuplicate: false });
            return;
        }
        const duplicates = await Lead.find({ $or: filter }).limit(5);
        successResponse(res, { duplicates, hasDuplicate: duplicates.length > 0 });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const mergeLeads = async (req, res) => {
    try {
        const { primaryLeadId, secondaryLeadId } = req.body;
        if (!primaryLeadId || !secondaryLeadId) {
            errorResponse(res, 'Both primaryLeadId and secondaryLeadId are required.', 400);
            return;
        }
        const [primary, secondary] = await Promise.all([
            Lead.findOne({
                $or: [{ referenceId: primaryLeadId }, ...(primaryLeadId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: primaryLeadId }] : [])],
            }),
            Lead.findOne({
                $or: [{ referenceId: secondaryLeadId }, ...(secondaryLeadId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: secondaryLeadId }] : [])],
            }),
        ]);
        if (!primary || !secondary) {
            errorResponse(res, 'One or both leads could not be found.', 404);
            return;
        }
        // Merge notes
        if (secondary.notes) {
            primary.notes = `${primary.notes || ''}\n[Merged from ${secondary.referenceId}]: ${secondary.notes}`.trim();
        }
        // Transfer activities
        await Activity.updateMany({ entityType: 'lead', entityId: secondary.referenceId }, { entityId: primary.referenceId });
        await primary.save();
        // Remove merged duplicate
        await Lead.findByIdAndDelete(secondary._id);
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'lead',
            entityId: primary.referenceId,
            type: 'note',
            title: 'Leads Merged',
            description: `Merged duplicate lead ${secondary.referenceId} (${secondary.buyerName}) into this lead.`,
            timestamp: new Date().toISOString(),
            performedBy: req.user?.email || 'CRM Lead Specialist',
        });
        successResponse(res, primary, 'Leads successfully merged.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
