import { Router } from 'express';
import { getPublicContent, getPublicSection, getAllSections, getSection, saveSectionDraft, publishSection, discardSectionDraft, } from './content.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
const router = Router();
// ==========================================
// 1. PUBLIC SAFE CONTENT ENDPOINTS
// ==========================================
router.get('/public', getPublicContent);
router.get('/public/:section', getPublicSection);
// ==========================================
// 2. PROTECTED STAFF CONTENT MANAGEMENT
// ==========================================
router.use(authenticate);
// Staff can inspect content drafts
router.get('/', requireRole('super-admin', 'admin', 'sales-manager', 'listing-manager'), getAllSections);
router.get('/:section', requireRole('super-admin', 'admin', 'sales-manager', 'listing-manager'), getSection);
// Modification & Publishing: Super Admin & Admin only
router.put('/:section', requireRole('super-admin', 'admin'), saveSectionDraft);
router.post('/:section/publish', requireRole('super-admin', 'admin'), publishSection);
router.post('/:section/discard', requireRole('super-admin', 'admin'), discardSectionDraft);
export default router;
