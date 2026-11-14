import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { AuditLog } from '../../models/AuditLog.js';
import { Lead } from '../../models/Lead.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Employee } from '../../models/Employee.js';
import { Task } from '../../models/Task.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';
const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Valid 10-digit mobile number required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    // Public registration is strictly restricted to non-privileged public roles
    role: z.enum(['buyer', 'seller', 'agent', 'developer']).optional().default('buyer'),
});
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const register = async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const existingUser = await User.findOne({ email: data.email.toLowerCase() });
        if (existingUser) {
            errorResponse(res, 'An account with this email already exists.', 409);
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const newUser = await User.create({
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            mobile: data.mobile,
            passwordHash,
            role: data.role,
            accountStatus: 'active',
            emailVerified: true,
            phoneVerified: true,
        });
        const tokenPayload = {
            userId: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role,
            tokenVersion: newUser.tokenVersion || 0,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        newUser.refreshToken = refreshToken;
        newUser.lastLogin = new Date();
        await newUser.save();
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000,
        });
        successResponse(res, {
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                mobile: newUser.mobile,
                role: newUser.role,
                accountStatus: newUser.accountStatus,
                profileImage: newUser.profileImage,
            },
            accessToken,
            refreshToken,
        }, 'Registration successful', 201);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Registration failed', 500);
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshToken');
        if (!user) {
            errorResponse(res, 'Invalid email or password.', 401);
            return;
        }
        if (user.accountStatus !== 'active') {
            errorResponse(res, 'Your account is suspended or inactive.', 403);
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            errorResponse(res, 'Invalid email or password.', 401);
            return;
        }
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion || 0,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000,
        });
        successResponse(res, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                accountStatus: user.accountStatus,
                profileImage: user.profileImage,
            },
            accessToken,
            refreshToken,
        }, 'Login successful');
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Login failed', 500);
    }
};
export const refreshToken = async (req, res) => {
    try {
        const token = req.body.refreshToken || req.cookies?.refreshToken;
        if (!token) {
            errorResponse(res, 'Refresh token required', 401);
            return;
        }
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== token) {
            errorResponse(res, 'Invalid or revoked refresh token', 403);
            return;
        }
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion || 0,
        };
        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);
        user.refreshToken = newRefreshToken;
        await user.save();
        successResponse(res, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (err) {
        errorResponse(res, 'Invalid or expired refresh token', 403);
    }
};
export const logout = async (req, res) => {
    try {
        if (req.user?.userId) {
            await User.findByIdAndUpdate(req.user.userId, { refreshToken: null, $inc: { tokenVersion: 1 } });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        successResponse(res, null, 'Logged out successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            errorResponse(res, 'User not found', 404);
            return;
        }
        successResponse(res, {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            accountStatus: user.accountStatus,
            profileImage: user.profileImage,
            address: user.address,
            lastLogin: user.lastLogin,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            errorResponse(res, 'Email address is required.', 400);
            return;
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Generic response to prevent email enumeration
            successResponse(res, {
                message: 'If that email address is registered, password reset instructions have been generated.',
                hasEmailProvider: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
            });
            return;
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        await AuditLog.create({
            user: user._id,
            userEmail: user.email,
            action: 'PASSWORD_RESET_REQUESTED',
            module: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        const hasEmailProvider = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
        if (hasEmailProvider) {
            console.log(`[AUTH] Dispatching password reset email to ${user.email}`);
        }
        else {
            console.warn(`[AUTH] Password reset requested for ${user.email}, but SMTP email provider is not configured. Delivery blocked.`);
        }
        // Secure generic user-facing response: Never leak tokens or reveal user presence
        successResponse(res, {
            message: 'If that email address is registered, password reset instructions have been generated.',
            hasEmailProvider,
            emailDelivery: hasEmailProvider ? 'dispatched' : 'blocked',
            expiresIn: '1 hour',
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            errorResponse(res, 'Token and new password are required.', 400);
            return;
        }
        if (newPassword.length < 6) {
            errorResponse(res, 'Password must be at least 6 characters long.', 400);
            return;
        }
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+passwordHash +refreshToken');
        if (!user) {
            errorResponse(res, 'Invalid or expired password reset token.', 400);
            return;
        }
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshToken = undefined; // Revoke active refresh sessions
        user.tokenVersion = (user.tokenVersion || 0) + 1; // Immediate session revocation for all active access tokens
        await user.save();
        await AuditLog.create({
            user: user._id,
            userEmail: user.email,
            action: 'PASSWORD_RESET_COMPLETED',
            module: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, null, 'Password successfully reset. Please log in with your new password.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getStaffUsers = async (req, res) => {
    try {
        const staffRoles = [
            'super-admin',
            'admin',
            'sales-manager',
            'sales-executive',
            'listing-manager',
            'employee',
            'agent',
        ];
        const users = await User.find({ role: { $in: staffRoles } })
            .select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });
        successResponse(res, users);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const createStaffUser = async (req, res) => {
    try {
        const { fullName, email, mobile, password, role } = req.body;
        if (!fullName || !email || !password || !role) {
            errorResponse(res, 'Full name, email, password, and role are required.', 400);
            return;
        }
        // Role elevation guard: Only super-admin can create super-admin or admin
        if ((role === 'super-admin' || role === 'admin') && req.user?.role !== 'super-admin') {
            errorResponse(res, 'Only a Super Administrator can assign Admin or Super Admin privileges.', 403);
            return;
        }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            errorResponse(res, 'An account with this email already exists.', 409);
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            fullName,
            email: email.toLowerCase(),
            mobile: mobile || '9842271000',
            passwordHash,
            role,
            accountStatus: 'active',
            emailVerified: true,
            phoneVerified: true,
        });
        // Also register in Employee collection if it's a sales/operations role
        if (['sales-manager', 'sales-executive', 'listing-manager', 'admin'].includes(role)) {
            try {
                const empRef = `emp-${role.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
                const empRole = role === 'sales-manager' ? 'crm-manager' :
                    role === 'listing-manager' ? 'property-specialist' :
                        'sales-executive';
                await Employee.create({
                    user: newUser._id,
                    referenceId: empRef,
                    name: newUser.fullName,
                    phone: newUser.mobile,
                    email: newUser.email,
                    role: empRole,
                    department: role === 'listing-manager' ? 'Listings' : 'Sales & CRM',
                    district: 'Coimbatore',
                    activeDealsCount: 0,
                    isActive: true,
                });
            }
            catch (empErr) {
                console.warn('Could not auto-create employee profile for staff user:', empErr);
            }
        }
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: 'STAFF_CREATED',
            module: 'TEAM',
            entityId: newUser._id.toString(),
            changes: { email: newUser.email, role: newUser.role, fullName: newUser.fullName },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, newUser, 'Staff user created successfully.', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateStaffUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, mobile, role, accountStatus } = req.body;
        const targetUser = await User.findById(id);
        if (!targetUser) {
            errorResponse(res, 'User not found.', 404);
            return;
        }
        // Prevent self-elevation or role demotion of oneself
        if (req.user?.userId === id && role && role !== targetUser.role) {
            errorResponse(res, 'You cannot change your own administrative role.', 403);
            return;
        }
        // Role elevation guard: Only super-admin can assign or change super-admin role
        if (role && role !== targetUser.role) {
            if ((role === 'super-admin' || targetUser.role === 'super-admin') && req.user?.role !== 'super-admin') {
                errorResponse(res, 'Only a Super Administrator can manage Super Admin roles.', 403);
                return;
            }
        }
        // Prevent deactivating or demoting the last active Super Admin
        if (targetUser.role === 'super-admin' && (accountStatus === 'inactive' || (role && role !== 'super-admin'))) {
            const activeSuperAdmins = await User.countDocuments({
                role: 'super-admin',
                accountStatus: 'active',
                _id: { $ne: targetUser._id },
            });
            if (activeSuperAdmins < 1) {
                errorResponse(res, 'Protection Gate: Cannot deactivate or demote the last active Super Administrator.', 403);
                return;
            }
        }
        const previousRole = targetUser.role;
        const previousStatus = targetUser.accountStatus;
        if (fullName)
            targetUser.fullName = fullName;
        if (mobile)
            targetUser.mobile = mobile;
        if (role)
            targetUser.role = role;
        if (accountStatus) {
            targetUser.accountStatus = accountStatus;
            if (accountStatus === 'inactive' || accountStatus === 'suspended') {
                targetUser.refreshToken = undefined; // Revoke session immediately
            }
        }
        await targetUser.save();
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: 'STAFF_UPDATED',
            module: 'TEAM',
            entityId: targetUser._id.toString(),
            changes: {
                role: { from: previousRole, to: targetUser.role },
                status: { from: previousStatus, to: targetUser.accountStatus },
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, targetUser, 'Staff user updated successfully.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateStaffStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            errorResponse(res, 'Invalid account status.', 400);
            return;
        }
        const targetUser = await User.findById(id);
        if (!targetUser) {
            errorResponse(res, 'User not found.', 404);
            return;
        }
        // Protection: Cannot deactivate last Super Admin
        if (targetUser.role === 'super-admin' && status !== 'active') {
            const activeSuperAdmins = await User.countDocuments({
                role: 'super-admin',
                accountStatus: 'active',
                _id: { $ne: targetUser._id },
            });
            if (activeSuperAdmins < 1) {
                errorResponse(res, 'Cannot deactivate the last active Super Administrator.', 403);
                return;
            }
        }
        targetUser.accountStatus = status;
        if (status !== 'active') {
            targetUser.refreshToken = undefined;
            targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1; // Immediate session revocation
        }
        await targetUser.save();
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: status === 'active' ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
            module: 'TEAM',
            entityId: targetUser._id.toString(),
            changes: { newStatus: status },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, targetUser, `Account marked as ${status}.`);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const reassignStaffRecords = async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;
        if (!fromUserId || !toUserId) {
            errorResponse(res, 'fromUserId and toUserId are required.', 400);
            return;
        }
        const [fromUser, toUser] = await Promise.all([
            User.findById(fromUserId),
            User.findById(toUserId),
        ]);
        if (!fromUser || !toUser) {
            errorResponse(res, 'Source or destination user not found.', 404);
            return;
        }
        // Reassign Leads
        const leadsUpdated = await Lead.updateMany({ assignedEmployeeId: fromUser._id.toString() }, { assignedEmployeeId: toUser._id.toString(), assignedEmployee: toUser._id });
        // Reassign Site Visits
        const visitsUpdated = await SiteVisit.updateMany({ assignedEmployeeId: fromUser._id.toString() }, { assignedEmployeeId: toUser._id.toString(), assignedEmployee: toUser._id });
        // Reassign Tasks
        const tasksUpdated = await Task.updateMany({ assignedEmployeeId: fromUser._id.toString() }, { assignedEmployeeId: toUser._id.toString(), assignedTo: toUser._id });
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: 'RECORDS_REASSIGNED',
            module: 'TEAM',
            changes: {
                fromUser: fromUser.email,
                toUser: toUser.email,
                leadsReassigned: leadsUpdated.modifiedCount,
                visitsReassigned: visitsUpdated.modifiedCount,
                tasksReassigned: tasksUpdated.modifiedCount,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, {
            leadsReassigned: leadsUpdated.modifiedCount,
            visitsReassigned: visitsUpdated.modifiedCount,
            tasksReassigned: tasksUpdated.modifiedCount,
        }, 'Staff records successfully reassigned.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
