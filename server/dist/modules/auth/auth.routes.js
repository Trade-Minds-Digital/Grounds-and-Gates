import { Router } from 'express';
import { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, getStaffUsers, createStaffUser, updateStaffUser, updateStaffStatus, reassignStaffRecords, } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
const router = Router();
// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// Authenticated session endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
// Staff and Permission Management endpoints
router.get('/users', authenticate, requireRole('super-admin', 'admin', 'sales-manager'), getStaffUsers);
router.post('/users', authenticate, requireRole('super-admin', 'admin'), createStaffUser);
router.patch('/users/:id', authenticate, requireRole('super-admin', 'admin'), updateStaffUser);
router.patch('/users/:id/status', authenticate, requireRole('super-admin', 'admin'), updateStaffStatus);
router.post('/users/reassign', authenticate, requireRole('super-admin', 'admin'), reassignStaffRecords);
router.get('/staff', authenticate, requireRole('super-admin', 'admin', 'sales-manager'), getStaffUsers);
router.post('/staff', authenticate, requireRole('super-admin', 'admin'), createStaffUser);
router.patch('/staff/:id', authenticate, requireRole('super-admin', 'admin'), updateStaffUser);
router.patch('/staff/:id/status', authenticate, requireRole('super-admin', 'admin'), updateStaffStatus);
router.post('/staff/reassign', authenticate, requireRole('super-admin', 'admin'), reassignStaffRecords);
export default router;
