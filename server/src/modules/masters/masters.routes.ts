import { Router } from 'express';
import {
  getPublicMasters,
  getPublicMastersBatch,
  getMasterGroups,
  getMasters,
  getMasterByIdOrCode,
  createMaster,
  updateMaster,
  toggleMasterStatus,
  getMasterUsage,
  deleteMaster,
  getMigrationReport,
} from './masters.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

// ==========================================
// 1. PUBLIC SAFE LOOKUP ENDPOINTS
// ==========================================
router.get('/public/batch', getPublicMastersBatch);
router.get('/public', getPublicMasters);

// ==========================================
// 2. PROTECTED STAFF MANAGEMENT ENDPOINTS
// ==========================================
router.use(authenticate);

// Staff view access
router.get(
  '/groups',
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'),
  getMasterGroups
);
router.get(
  '/',
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'),
  getMasters
);
// Migration dry run report
router.get('/migration/report', requireRole('super-admin'), getMigrationReport);

router.get(
  '/:type/:idOrCode',
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'),
  getMasterByIdOrCode
);
router.get(
  '/:type/:id/usage',
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'),
  getMasterUsage
);

// Staff modification access: Super Admin & Admin only
router.post('/:type', requireRole('super-admin', 'admin'), createMaster);
router.put('/:type/:id', requireRole('super-admin', 'admin'), updateMaster);
router.patch('/:type/:id/status', requireRole('super-admin', 'admin'), toggleMasterStatus);
router.delete('/:type/:id', requireRole('super-admin', 'admin'), deleteMaster);

export default router;
