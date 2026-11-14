import { Router } from 'express';
import { getDashboardAnalytics } from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'seller'),
  getDashboardAnalytics
);

export default router;
