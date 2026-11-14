import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive'));

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;

