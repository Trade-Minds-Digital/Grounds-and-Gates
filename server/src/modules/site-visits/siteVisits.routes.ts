import { Router } from 'express';
import {
  getSiteVisits,
  scheduleSiteVisit,
  updateSiteVisit,
} from './siteVisits.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'seller', 'buyer'),
  getSiteVisits
);

router.post(
  '/',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'buyer'),
  scheduleSiteVisit
);

router.patch(
  '/:id',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive'),
  updateSiteVisit
);

export default router;
