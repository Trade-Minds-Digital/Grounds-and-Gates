import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getAuditLogs = async (req, res) => {
    try {
        const { module, action, userEmail, page = '1', limit = '50' } = req.query;
        const filter = {};
        if (module && module !== 'all')
            filter.module = module;
        if (action && action !== 'all')
            filter.action = action;
        if (userEmail)
            filter.userEmail = { $regex: userEmail, $options: 'i' };
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;
        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('user', 'fullName email role'),
            AuditLog.countDocuments(filter),
        ]);
        successResponse(res, logs, 'Audit logs retrieved successfully', 200, {
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
