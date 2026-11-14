import { Response } from 'express';
import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { module, action, userEmail, page = '1', limit = '50' } = req.query as Record<string, string>;
    const filter: any = {};

    if (module && module !== 'all') filter.module = module;
    if (action && action !== 'all') filter.action = action;
    if (userEmail) filter.userEmail = { $regex: userEmail, $options: 'i' };

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
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

