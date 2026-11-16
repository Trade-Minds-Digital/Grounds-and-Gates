import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { AuditLog } from '../../models/AuditLog.js';
import { Lead } from '../../models/Lead.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Employee } from '../../models/Employee.js';
import { Task } from '../../models/Task.js';
import { VerificationChallenge, generateNumericOtp, hashOtp, verifyOtpHash, maskEmail, } from '../../models/VerificationChallenge.js';
import { emailService } from '../../services/emailService.js';
import { config } from '../../config/index.js';
import { firebaseAdmin } from '../../config/firebaseAdmin.js';
import { runLegacyUsersMigration } from '../../database/usersMigration.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';
const onboardingSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().min(10, 'Valid 10-digit mobile number required'),
    accountUsage: z.enum(['buyer', 'seller', 'both']).optional().default('buyer'),
    role: z.enum(['buyer', 'seller']).optional(),
    address: z
        .object({
        street: z.string().optional(),
        locality: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
    })
        .optional(),
    sellerDetails: z
        .object({
        sellerType: z.enum(['owner', 'agent', 'builder', 'developer']).optional(),
        companyName: z.string().optional(),
        reraNumber: z.string().optional(),
        licenseNumber: z.string().optional(),
        taxId: z.string().optional(),
        operatingAreas: z.array(z.string()).optional(),
        preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).optional(),
    })
        .optional(),
    consents: z
        .object({
        termsAccepted: z.literal(true, {
            errorMap: () => ({ message: 'You must accept the Terms and Conditions and Privacy Policy' }),
        }),
        termsPolicyVersion: z.string().optional(),
        privacyAccepted: z.boolean().optional(),
        marketingConsent: z.boolean().optional().default(false),
    })
        .optional(),
    termsAccepted: z.boolean().optional(),
    marketingConsent: z.boolean().optional(),
});
export const onboarding = async (req, res) => {
    try {
        const firebaseUser = req.firebaseUser;
        if (!firebaseUser?.uid || !firebaseUser?.email) {
            errorResponse(res, 'Authentication required. No valid Firebase identity found.', 401);
            return;
        }
        if (req.body.role &&
            ['super-admin', 'admin', 'employee', 'sales-manager', 'sales-executive', 'listing-manager'].includes(req.body.role)) {
            errorResponse(res, 'Privileged staff accounts cannot be registered through public onboarding.', 403);
            return;
        }
        const data = onboardingSchema.parse(req.body);
        const termsAccepted = data.consents?.termsAccepted ?? data.termsAccepted;
        if (!termsAccepted) {
            errorResponse(res, 'You must accept the Terms and Conditions and Privacy Policy to register.', 400);
            return;
        }
        const normalizedEmail = firebaseUser.email.toLowerCase().trim();
        let assignedRole = 'buyer';
        const accountUsage = data.accountUsage || (data.role === 'seller' ? 'seller' : 'buyer');
        if (accountUsage === 'seller' || accountUsage === 'both' || data.role === 'seller') {
            assignedRole = 'seller';
        }
        // 1. Idempotency check: user already exists for this firebaseUid
        let user = await User.findOne({ firebaseUid: firebaseUser.uid });
        if (user) {
            user.fullName = data.fullName;
            user.mobile = data.mobile;
            user.accountUsage = accountUsage;
            user.role = assignedRole;
            if (data.address)
                user.address = { ...user.address, ...data.address };
            if (data.sellerDetails)
                user.sellerDetails = data.sellerDetails;
            if (firebaseUser.email_verified && !user.emailVerified) {
                user.emailVerified = true;
                user.emailVerifiedAt = new Date();
            }
            await user.save();
            successResponse(res, { user }, 'Profile updated successfully.');
            return;
        }
        // 2. Check if user already exists with matching email (linking legacy account)
        user = await User.findOne({ email: normalizedEmail });
        if (user) {
            user.firebaseUid = firebaseUser.uid;
            user.fullName = data.fullName || user.fullName;
            user.mobile = data.mobile || user.mobile;
            user.accountUsage = accountUsage || user.accountUsage;
            user.role = assignedRole || user.role;
            if (data.address)
                user.address = { ...user.address, ...data.address };
            if (data.sellerDetails)
                user.sellerDetails = data.sellerDetails;
            if (firebaseUser.email_verified && !user.emailVerified) {
                user.emailVerified = true;
                user.emailVerifiedAt = new Date();
            }
            await user.save();
            successResponse(res, { user }, 'Account linked successfully.');
            return;
        }
        // 3. Create new MongoDB profile
        user = await User.create({
            firebaseUid: firebaseUser.uid,
            fullName: data.fullName,
            email: normalizedEmail,
            mobile: data.mobile,
            role: assignedRole,
            accountUsage,
            address: data.address,
            sellerDetails: data.sellerDetails,
            consents: {
                termsAccepted: true,
                termsAcceptedAt: new Date(),
                termsPolicyVersion: data.consents?.termsPolicyVersion || '2026.1',
                marketingConsent: Boolean(data.consents?.marketingConsent ?? data.marketingConsent),
                marketingConsentAt: (data.consents?.marketingConsent ?? data.marketingConsent) ? new Date() : undefined,
            },
            accountStatus: 'active',
            emailVerified: Boolean(firebaseUser.email_verified),
            phoneVerified: false,
        });
        await AuditLog.create({
            user: user._id,
            userEmail: user.email,
            action: 'USER_REGISTERED_FIREBASE',
            module: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, { user }, 'Registration and profile setup completed successfully.', 201);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Onboarding failed', 500);
    }
};
export const syncVerification = async (req, res) => {
    try {
        const firebaseUser = req.firebaseUser;
        const userId = req.user?.userId;
        let isVerified = Boolean(firebaseUser?.email_verified);
        const uid = firebaseUser?.uid || req.user?.firebaseUid;
        if (uid && !isVerified) {
            try {
                const record = await firebaseAdmin.getUser(uid);
                if (record?.emailVerified) {
                    isVerified = true;
                }
            }
            catch { }
        }
        let user = null;
        if (uid) {
            user = await User.findOne({ firebaseUid: uid });
        }
        if (!user && userId) {
            user = await User.findById(userId);
        }
        if (!user) {
            errorResponse(res, 'User profile not found', 404);
            return;
        }
        if (isVerified && !user.emailVerified) {
            user.emailVerified = true;
            user.emailVerifiedAt = new Date();
            await user.save();
        }
        successResponse(res, {
            emailVerified: user.emailVerified,
            email: user.email,
            message: user.emailVerified
                ? 'Email verification confirmed.'
                : 'Email is not verified yet. Please click the link sent to your inbox.',
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Valid 10-digit mobile number required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    accountUsage: z.enum(['buyer', 'seller', 'both']).optional().default('buyer'),
    // Public registration is strictly restricted to non-privileged public roles
    role: z.enum(['buyer', 'seller', 'agent', 'developer']).optional(),
    address: z
        .object({
        street: z.string().optional(),
        locality: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
    })
        .optional(),
    sellerDetails: z
        .object({
        sellerType: z.enum(['owner', 'agent', 'builder', 'developer']).optional(),
        companyName: z.string().optional(),
        reraNumber: z.string().optional(),
        licenseNumber: z.string().optional(),
        taxId: z.string().optional(),
        operatingAreas: z.array(z.string()).optional(),
        preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).optional(),
    })
        .optional(),
    consents: z
        .object({
        termsAccepted: z.literal(true, {
            errorMap: () => ({ message: 'You must accept the Terms of Service and Privacy Policy' }),
        }),
        termsPolicyVersion: z.string().optional(),
        privacyAccepted: z.boolean().optional(),
        marketingConsent: z.boolean().optional().default(false),
    })
        .optional(),
    termsAccepted: z.boolean().optional(),
    marketingConsent: z.boolean().optional(),
});
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
const verifyEmailSchema = z.object({
    challengeId: z.string().min(1, 'Challenge ID is required'),
    otp: z.string().length(6, 'Verification code must be 6 digits'),
});
const resendOtpSchema = z.object({
    challengeId: z.string().min(1, 'Challenge ID is required'),
});
const changeEmailSchema = z.object({
    challengeId: z.string().min(1, 'Challenge ID is required'),
    newEmail: z.string().email('Valid new email address is required'),
});
/**
 * Helper to issue an OTP verification challenge and send email
 */
async function issueOtpChallenge(user) {
    // Invalidate any previously active verification challenges for this user/email
    await VerificationChallenge.updateMany({ email: user.email.toLowerCase(), purpose: 'email_verification', status: 'active' }, { status: 'superseded' });
    const otp = generateNumericOtp();
    const challengeId = crypto.randomUUID();
    const otpHash = hashOtp(otp, user.email);
    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000); // 10 minutes
    const resendCooldownUntil = new Date(now + 60 * 1000); // 60 seconds
    await VerificationChallenge.create({
        challengeId,
        userId: user._id,
        email: user.email.toLowerCase(),
        purpose: 'email_verification',
        otpHash,
        expiresAt,
        resendCooldownUntil,
        attempts: 0,
        maxAttempts: 5,
        consumed: false,
        status: 'active',
    });
    // Dispatch branded verification email
    await emailService.sendVerificationOtp({
        to: user.email,
        name: user.fullName,
        otp,
        expiresInMinutes: 10,
    });
    return {
        challengeId,
        maskedEmail: maskEmail(user.email),
        expiresInSeconds: 600,
        resendCooldownSeconds: 60,
    };
}
export const register = async (req, res) => {
    try {
        const rawRole = req.body.role;
        // Strict privilege guard: reject any attempt to register as admin/staff
        const forbiddenRoles = [
            'super-admin',
            'admin',
            'employee',
            'sales-manager',
            'sales-executive',
            'listing-manager',
        ];
        if (rawRole && forbiddenRoles.includes(rawRole)) {
            errorResponse(res, 'Privileged staff accounts cannot be registered through public portal.', 400);
            return;
        }
        const data = registerSchema.parse(req.body);
        // Terms acceptance verification (defaults to true for legacy compatibility if omitted)
        const termsAccepted = data.consents?.termsAccepted ?? data.termsAccepted ?? true;
        if (!termsAccepted) {
            errorResponse(res, 'You must accept the Terms and Conditions and Privacy Policy to register.', 400);
            return;
        }
        const normalizedEmail = data.email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        // Reconcile role with accountUsage
        let assignedRole = 'buyer';
        const accountUsage = data.accountUsage || (data.role === 'seller' ? 'seller' : 'buyer');
        if (accountUsage === 'seller' || accountUsage === 'both' || data.role === 'seller') {
            assignedRole = 'seller';
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        let targetUser = existingUser;
        if (existingUser) {
            // If user exists and is already verified, reject registration
            if (existingUser.emailVerified) {
                errorResponse(res, 'An account with this email already exists.', 409);
                return;
            }
            // If user exists but is unverified (pending), update details and re-issue verification
            existingUser.fullName = data.fullName;
            existingUser.mobile = data.mobile;
            existingUser.passwordHash = passwordHash;
            existingUser.role = assignedRole;
            existingUser.accountUsage = accountUsage;
            if (data.address)
                existingUser.address = { ...existingUser.address, ...data.address };
            if (data.sellerDetails)
                existingUser.sellerDetails = data.sellerDetails;
            existingUser.consents = {
                termsAccepted: true,
                termsAcceptedAt: new Date(),
                termsPolicyVersion: data.consents?.termsPolicyVersion || '2026.1',
                marketingConsent: Boolean(data.consents?.marketingConsent ?? data.marketingConsent),
                marketingConsentAt: (data.consents?.marketingConsent ?? data.marketingConsent) ? new Date() : undefined,
            };
            existingUser.accountStatus = 'active';
            await existingUser.save();
            targetUser = existingUser;
        }
        else {
            // Create new pending user
            targetUser = await User.create({
                fullName: data.fullName,
                email: normalizedEmail,
                mobile: data.mobile,
                passwordHash,
                role: assignedRole,
                accountUsage,
                address: data.address,
                sellerDetails: data.sellerDetails,
                consents: {
                    termsAccepted: true,
                    termsAcceptedAt: new Date(),
                    termsPolicyVersion: data.consents?.termsPolicyVersion || '2026.1',
                    marketingConsent: Boolean(data.consents?.marketingConsent ?? data.marketingConsent),
                    marketingConsentAt: (data.consents?.marketingConsent ?? data.marketingConsent) ? new Date() : undefined,
                },
                accountStatus: 'active',
                emailVerified: false,
                phoneVerified: false,
            });
        }
        // Issue OTP verification challenge
        const challengeInfo = await issueOtpChallenge(targetUser);
        const tokenPayload = {
            userId: targetUser._id.toString(),
            email: targetUser.email,
            role: targetUser.role,
            tokenVersion: targetUser.tokenVersion || 0,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        await AuditLog.create({
            user: targetUser._id,
            userEmail: targetUser.email,
            action: 'USER_REGISTERED_PENDING_VERIFICATION',
            module: 'AUTH',
            entityId: targetUser._id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, {
            user: targetUser,
            accessToken,
            refreshToken,
            requiresEmailVerification: true,
            challengeId: challengeInfo.challengeId,
            maskedEmail: challengeInfo.maskedEmail,
            expiresInSeconds: challengeInfo.expiresInSeconds,
            resendCooldownSeconds: challengeInfo.resendCooldownSeconds,
        }, 'Registration successful. Please enter the 6-digit verification code sent to your email.', 201);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Registration failed', 500);
    }
};
export const verifyEmail = async (req, res) => {
    try {
        const { challengeId, otp } = verifyEmailSchema.parse(req.body);
        const challenge = await VerificationChallenge.findOne({ challengeId });
        if (!challenge || challenge.status === 'superseded') {
            errorResponse(res, 'Invalid or expired verification session.', 400);
            return;
        }
        if (challenge.consumed || challenge.status === 'consumed') {
            errorResponse(res, 'This verification code has already been used.', 400);
            return;
        }
        if (challenge.status === 'exhausted' || challenge.attempts >= challenge.maxAttempts) {
            errorResponse(res, 'Maximum verification attempts exceeded. Please request a new code.', 429);
            return;
        }
        if (challenge.expiresAt < new Date()) {
            challenge.status = 'expired';
            await challenge.save();
            errorResponse(res, 'This verification code has expired. Please request a new code.', 400);
            return;
        }
        const isMatch = verifyOtpHash(otp, challenge.email, challenge.otpHash);
        if (!isMatch) {
            challenge.attempts += 1;
            if (challenge.attempts >= challenge.maxAttempts) {
                challenge.status = 'exhausted';
            }
            await challenge.save();
            const attemptsRemaining = Math.max(0, challenge.maxAttempts - challenge.attempts);
            errorResponse(res, attemptsRemaining > 0
                ? `Invalid verification code. ${attemptsRemaining} attempt(s) remaining.`
                : 'Maximum verification attempts exceeded. Please request a new code.', 400, { attemptsRemaining });
            return;
        }
        // Atomic consumption
        challenge.consumed = true;
        challenge.consumedAt = new Date();
        challenge.status = 'consumed';
        await challenge.save();
        const user = await User.findById(challenge.userId);
        if (!user) {
            errorResponse(res, 'User account associated with this challenge was not found.', 404);
            return;
        }
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        user.accountStatus = 'active';
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
        await AuditLog.create({
            user: user._id,
            userEmail: user.email,
            action: 'EMAIL_VERIFIED',
            module: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                accountUsage: user.accountUsage,
                sellerDetails: user.sellerDetails,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
                profileImage: user.profileImage,
            },
            accessToken,
            refreshToken,
        }, 'Email verified successfully! Welcome to Grounds & Gates.');
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Verification failed', 500);
    }
};
export const resendVerificationOtp = async (req, res) => {
    try {
        const { challengeId } = resendOtpSchema.parse(req.body);
        const oldChallenge = await VerificationChallenge.findOne({ challengeId });
        if (!oldChallenge) {
            errorResponse(res, 'Verification session not found.', 404);
            return;
        }
        // Cooldown enforcement: 60 seconds between resends
        if (oldChallenge.resendCooldownUntil > new Date()) {
            const waitSeconds = Math.ceil((oldChallenge.resendCooldownUntil.getTime() - Date.now()) / 1000);
            errorResponse(res, `Please wait ${waitSeconds} seconds before requesting a new verification code.`, 429, { cooldownSecondsRemaining: waitSeconds });
            return;
        }
        const user = await User.findById(oldChallenge.userId);
        if (!user) {
            errorResponse(res, 'User account not found.', 404);
            return;
        }
        if (user.emailVerified) {
            errorResponse(res, 'This email address is already verified. Please sign in.', 400);
            return;
        }
        // Mark previous challenge superseded
        oldChallenge.status = 'superseded';
        await oldChallenge.save();
        // Generate new OTP and challenge
        const otp = generateNumericOtp();
        const newChallengeId = crypto.randomUUID();
        const otpHash = hashOtp(otp, user.email);
        const now = Date.now();
        const expiresAt = new Date(now + 10 * 60 * 1000);
        const resendCooldownUntil = new Date(now + 60 * 1000);
        await VerificationChallenge.create({
            challengeId: newChallengeId,
            userId: user._id,
            email: user.email.toLowerCase(),
            purpose: 'email_verification',
            otpHash,
            expiresAt,
            resendCooldownUntil,
            attempts: 0,
            maxAttempts: 5,
            consumed: false,
            status: 'active',
        });
        await emailService.sendResentOtp({
            to: user.email,
            name: user.fullName,
            otp,
            expiresInMinutes: 10,
        });
        successResponse(res, {
            challengeId: newChallengeId,
            maskedEmail: maskEmail(user.email),
            expiresInSeconds: 600,
            resendCooldownSeconds: 60,
        }, 'A new verification code has been dispatched to your email.');
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Resend failed', 500);
    }
};
export const changeVerificationEmail = async (req, res) => {
    try {
        const { challengeId, newEmail } = changeEmailSchema.parse(req.body);
        const normalizedNewEmail = newEmail.toLowerCase().trim();
        const oldChallenge = await VerificationChallenge.findOne({ challengeId, status: 'active' });
        if (!oldChallenge) {
            errorResponse(res, 'Active verification session not found.', 404);
            return;
        }
        // Check if new email is already verified by an existing user
        const existing = await User.findOne({ email: normalizedNewEmail });
        if (existing && existing.emailVerified) {
            errorResponse(res, 'An account with this email address already exists and is verified.', 409);
            return;
        }
        const user = await User.findById(oldChallenge.userId);
        if (!user) {
            errorResponse(res, 'User account not found.', 404);
            return;
        }
        // Invalidate old challenge
        oldChallenge.status = 'superseded';
        await oldChallenge.save();
        // Update pending user's email
        user.email = normalizedNewEmail;
        await user.save();
        // Issue new challenge for updated email
        const challengeInfo = await issueOtpChallenge(user);
        successResponse(res, {
            challengeId: challengeInfo.challengeId,
            maskedEmail: challengeInfo.maskedEmail,
            expiresInSeconds: challengeInfo.expiresInSeconds,
            resendCooldownSeconds: challengeInfo.resendCooldownSeconds,
        }, `Verification email updated. A new code has been sent to ${challengeInfo.maskedEmail}.`);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            errorResponse(res, 'Validation error', 400, err.issues);
            return;
        }
        errorResponse(res, err.message || 'Change email failed', 500);
    }
};
export const getVerificationStatus = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const challenge = await VerificationChallenge.findOne({ challengeId });
        if (!challenge) {
            errorResponse(res, 'Verification challenge not found.', 404);
            return;
        }
        const now = new Date();
        const isExpired = challenge.expiresAt < now;
        const canResend = challenge.resendCooldownUntil <= now;
        const attemptsRemaining = Math.max(0, challenge.maxAttempts - challenge.attempts);
        successResponse(res, {
            challengeId: challenge.challengeId,
            maskedEmail: maskEmail(challenge.email),
            status: challenge.status,
            expiresAt: challenge.expiresAt,
            resendCooldownUntil: challenge.resendCooldownUntil,
            isExpired,
            canResend,
            attemptsRemaining,
        });
    }
    catch (err) {
        errorResponse(res, err.message || 'Failed to fetch verification status', 500);
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
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            errorResponse(res, 'Invalid email or password.', 401);
            return;
        }
        if (user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
            errorResponse(res, 'Your account is deactivated or suspended. Please contact Grounds & Gates concierge.', 403);
            return;
        }
        // Unverified user detection: Return 403 with challenge details so UI can transition seamlessly
        if (!user.emailVerified) {
            const challengeInfo = await issueOtpChallenge(user);
            errorResponse(res, 'Please verify your email address to access your account.', 403, {
                requiresEmailVerification: true,
                challengeId: challengeInfo.challengeId,
                maskedEmail: challengeInfo.maskedEmail,
                expiresInSeconds: challengeInfo.expiresInSeconds,
                resendCooldownSeconds: challengeInfo.resendCooldownSeconds,
            });
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
                accountUsage: user.accountUsage,
                sellerDetails: user.sellerDetails,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
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
            accountUsage: user.accountUsage,
            sellerDetails: user.sellerDetails,
            consents: user.consents,
            accountStatus: user.accountStatus,
            emailVerified: user.emailVerified,
            emailVerifiedAt: user.emailVerifiedAt,
            profileImage: user.profileImage,
            address: user.address,
            lastLogin: user.lastLogin,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            errorResponse(res, 'Unauthorized', 401);
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            errorResponse(res, 'User not found', 404);
            return;
        }
        const { fullName, mobile, address, sellerDetails, profileImage, consents } = req.body;
        // Strict privilege guard: users cannot modify their role, accountStatus, or emailVerified via profile update
        if (req.body.role || req.body.accountStatus || req.body.emailVerified !== undefined) {
            errorResponse(res, 'Cannot modify privileged security fields through profile update.', 403);
            return;
        }
        if (fullName)
            user.fullName = fullName.trim();
        if (mobile)
            user.mobile = mobile.trim();
        if (profileImage !== undefined)
            user.profileImage = profileImage;
        if (address) {
            user.address = {
                ...user.address,
                street: address.street ?? user.address?.street,
                locality: address.locality ?? user.address?.locality,
                city: address.city ?? user.address?.city,
                district: address.district ?? user.address?.district,
                state: address.state ?? user.address?.state ?? 'Tamil Nadu',
                pincode: address.pincode ?? user.address?.pincode,
            };
        }
        if (sellerDetails && (user.role === 'seller' || user.accountUsage === 'seller' || user.accountUsage === 'both')) {
            user.sellerDetails = {
                ...user.sellerDetails,
                sellerType: sellerDetails.sellerType ?? user.sellerDetails?.sellerType,
                companyName: sellerDetails.companyName ?? user.sellerDetails?.companyName,
                reraNumber: sellerDetails.reraNumber ?? user.sellerDetails?.reraNumber,
                licenseNumber: sellerDetails.licenseNumber ?? user.sellerDetails?.licenseNumber,
                taxId: sellerDetails.taxId ?? user.sellerDetails?.taxId,
                operatingAreas: sellerDetails.operatingAreas ?? user.sellerDetails?.operatingAreas,
                preferredContactMethod: sellerDetails.preferredContactMethod ?? user.sellerDetails?.preferredContactMethod,
            };
        }
        if (consents && consents.marketingConsent !== undefined) {
            user.consents = {
                ...user.consents,
                termsAccepted: user.consents?.termsAccepted ?? true,
                marketingConsent: Boolean(consents.marketingConsent),
                marketingConsentAt: consents.marketingConsent ? new Date() : undefined,
            };
        }
        await user.save();
        await AuditLog.create({
            user: user._id,
            userEmail: user.email,
            action: 'PROFILE_UPDATED',
            module: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            accountUsage: user.accountUsage,
            sellerDetails: user.sellerDetails,
            consents: user.consents,
            accountStatus: user.accountStatus,
            emailVerified: user.emailVerified,
            profileImage: user.profileImage,
            address: user.address,
        }, 'Profile updated successfully.');
    }
    catch (err) {
        errorResponse(res, err.message || 'Profile update failed', 500);
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
                message: 'If that email address is registered, password reset instructions have been dispatched.',
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
        const resetUrl = `${config.appUrl}/reset-password?token=${rawToken}`;
        await emailService.sendPasswordResetEmail({
            to: user.email,
            name: user.fullName,
            resetUrl,
            expiresInHours: 1,
        });
        // Secure generic user-facing response: Never leak tokens
        successResponse(res, {
            message: 'If that email address is registered, password reset instructions have been dispatched.',
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
        // Send confirmation notice
        await emailService.sendPasswordChangedNotification({
            to: user.email,
            name: user.fullName,
        });
        successResponse(res, null, 'Password successfully reset. Please log in with your new password.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getMigrationStatus = async (req, res) => {
    try {
        const dryRun = req.query.dryRun !== 'false';
        const report = await runLegacyUsersMigration({ dryRun });
        successResponse(res, report, 'Migration audit completed.');
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
        // Provision Firebase User account for staff member
        let firebaseUid;
        try {
            const fbUser = await firebaseAdmin.createUser({
                email: email.toLowerCase(),
                password,
                displayName: fullName,
                emailVerified: true,
            });
            firebaseUid = fbUser.uid;
        }
        catch (fbErr) {
            console.warn('[Staff] Firebase user provisioning notice:', fbErr.message);
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        let newUser;
        try {
            newUser = await User.create({
                firebaseUid,
                fullName,
                email: email.toLowerCase(),
                mobile: mobile || '9842271000',
                passwordHash,
                role,
                accountStatus: 'active',
                emailVerified: true,
                phoneVerified: true,
            });
        }
        catch (dbErr) {
            // Safe rollback on database failure
            if (firebaseUid) {
                try {
                    await firebaseAdmin.deleteUser(firebaseUid);
                }
                catch { }
            }
            throw dbErr;
        }
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
        // Synchronize session revocation and disabled status with Firebase Auth
        if (targetUser.firebaseUid) {
            try {
                if (status === 'inactive' || status === 'suspended') {
                    await firebaseAdmin.revokeRefreshTokens(targetUser.firebaseUid);
                    await firebaseAdmin.updateUser(targetUser.firebaseUid, { disabled: true });
                }
                else if (status === 'active') {
                    await firebaseAdmin.updateUser(targetUser.firebaseUid, { disabled: false });
                }
            }
            catch (fbErr) {
                console.warn('[Staff] Failed to sync status with Firebase Auth:', fbErr.message);
            }
        }
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
