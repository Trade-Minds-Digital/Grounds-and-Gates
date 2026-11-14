import { Router } from 'express';
import { getDashboardAnalytics, getProvenanceReportEndpoint } from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
const router = Router();
router.get('/dashboard', authenticate, requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'seller'), getDashboardAnalytics);
router.get('/provenance', authenticate, requireRole('super-admin', 'admin'), getProvenanceReportEndpoint);
export default router;
