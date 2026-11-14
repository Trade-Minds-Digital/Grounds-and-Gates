import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLeadStage,
  assignLead,
  checkDuplicateLead,
  mergeLeads,
} from './leads.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.post('/check-duplicate', authenticate, checkDuplicateLead);
router.post('/merge', authenticate, requireRole('super-admin', 'admin', 'sales-manager'), mergeLeads);

router.get(
  '/',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'seller'),
  getLeads
);

router.get(
  '/:id',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'seller'),
  getLeadById
);

router.post(
  '/',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'seller'),
  createLead
);

router.patch(
  '/:id/stage',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'seller'),
  updateLeadStage
);

router.patch(
  '/:id/assign',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager'),
  assignLead
);

export default router;
