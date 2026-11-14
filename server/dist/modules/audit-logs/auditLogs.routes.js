import { Router } from 'express';
import { getAuditLogs } from './auditLogs.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
const router = Router();
router.use(authenticate);
router.use(requireRole('super-admin', 'admin'));
router.get('/', getAuditLogs);
export default router;
