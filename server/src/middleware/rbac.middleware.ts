import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { errorResponse } from '../utils/response.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { IPermission } from '../models/Permission.js';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required.', 401);
      return;
    }

    // Super-admin has access to everything
    if (req.user.role === 'super-admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
};

export const requirePermission = (module: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        errorResponse(res, 'Authentication required.', 401);
        return;
      }

      if (req.user.role === 'super-admin') {
        next();
        return;
      }

      // Check role permissions in DB
      const user = await User.findById(req.user.userId);
      if (!user) {
        errorResponse(res, 'User not found.', 404);
        return;
      }

      const role = await Role.findOne({ slug: user.role }).populate<{ permissions: IPermission[] }>('permissions');
      if (!role) {
        errorResponse(res, 'User role definition not found.', 403);
        return;
      }

      const hasPerm = role.permissions.some(
        (p) => (p.module === module || p.module === '*') && (p.action === action || p.action === ('manage' as any))
      );

      if (!hasPerm) {
        errorResponse(res, `Access denied. Missing permission: ${module}.${action}`, 403);
        return;
      }

      next();
    } catch (err: any) {
      errorResponse(res, 'Permission verification failed.', 500, err.message);
    }
  };
};
