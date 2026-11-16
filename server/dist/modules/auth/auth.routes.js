import { Router } from 'express';
import { onboarding, syncVerification, getMe, updateProfile, getMigrationStatus, getStaffUsers, createStaffUser, updateStaffUser, updateStaffStatus, reassignStaffRecords, 
// Legacy compatibility endpoints
register, login, refreshToken, logout, forgotPassword, resetPassword, verifyEmail, resendVerificationOtp, changeVerificationEmail, getVerificationStatus, } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
const router = Router();
// ─── Firebase Auth Endpoints ──────────────────────────────────────────
// Synchronize client Firebase identity with MongoDB profile (idempotent onboarding)
router.post('/onboarding', authenticate, onboarding);
router.post('/sync-profile', authenticate, onboarding);
// Verify current email verification status with Firebase
router.post('/sync-verification', authenticate, syncVerification);
// Current user profile endpoints
router.get('/me', authenticate, getMe);
router.get('/profile', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);
// Legacy User Migration Status & Audit
router.get('/migration/status', authenticate, requireRole('super-admin', 'admin'), getMigrationStatus);
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
// ─── Legacy Fallback Endpoints (Maintained for Migration Compatibility) ─
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/change-verification-email', changeVerificationEmail);
router.get('/verification-status/:challengeId', getVerificationStatus);
export default router;
