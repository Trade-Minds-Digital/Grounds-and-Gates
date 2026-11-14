import { Router } from 'express';
import { getProjects, getProjectByIdOrSlug, createProject } from './projects.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', getProjects);
router.get('/:idOrSlug', getProjectByIdOrSlug);
router.post('/', authenticate, requireRole('super-admin', 'admin', 'developer'), createProject);

export default router;
