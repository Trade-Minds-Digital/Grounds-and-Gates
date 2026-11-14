import { Router } from 'express';
import {
  createEnquiry,
  getMyEnquiries,
  getAllEnquiries,
  updateEnquiryStatus,
} from './enquiries.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

// Public enquiry submission
router.post('/', createEnquiry);

// Authenticated user enquiries
router.get('/my-enquiries', authenticate, getMyEnquiries);

// Admin / Seller enquiry management
router.get(
  '/seller-leads',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'seller'),
  getAllEnquiries
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive'),
  updateEnquiryStatus
);

export default router;
