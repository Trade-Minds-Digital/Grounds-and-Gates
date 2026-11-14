import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
const router = Router();
router.use(authenticate);
// All staff can view settings
router.get('/', requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'), getSettings);
// Only Super Admin can modify system settings
router.put('/', requireRole('super-admin'), updateSettings);
export default router;
