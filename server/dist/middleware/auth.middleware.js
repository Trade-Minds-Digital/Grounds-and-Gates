import { firebaseAdmin } from '../config/firebaseAdmin.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { User } from '../models/User.js';
export const authenticate = async (req, res, next) => {
    try {
        let token;
        // Check Authorization header: Bearer <token>
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            errorResponse(res, 'Authentication required. No token provided.', 401);
            return;
        }
        let decodedFirebase = null;
        let decodedLegacy = null;
        // Try Firebase ID token verification first
        try {
            decodedFirebase = await firebaseAdmin.verifyIdToken(token, true);
        }
        catch (fbErr) {
            // Check for specific Firebase revocation / disabled errors
            if (fbErr.code === 'auth/id-token-revoked') {
                errorResponse(res, 'Session has been revoked. Please sign in again.', 401, { code: 'SESSION_REVOKED' });
                return;
            }
            if (fbErr.code === 'auth/user-disabled') {
                errorResponse(res, 'Account has been disabled. Please contact support.', 403, { code: 'ACCOUNT_DISABLED' });
                return;
            }
            if (fbErr.code === 'auth/id-token-expired') {
                errorResponse(res, 'Authentication token expired.', 401, { code: 'TOKEN_EXPIRED' });
                return;
            }
            // If Firebase verification failed, check for legacy JWT fallback during migration
            try {
                decodedLegacy = verifyAccessToken(token);
            }
            catch (jwtErr) {
                if (jwtErr.name === 'TokenExpiredError') {
                    errorResponse(res, 'Access token expired.', 401, { code: 'TOKEN_EXPIRED' });
                    return;
                }
                errorResponse(res, 'Invalid authentication token.', 401);
                return;
            }
        }
        if (decodedFirebase) {
            req.firebaseUser = decodedFirebase;
            // Look up MongoDB user by firebaseUid
            let user = await User.findOne({ firebaseUid: decodedFirebase.uid });
            // If not yet linked by firebaseUid, link by verified email
            if (!user && decodedFirebase.email) {
                user = await User.findOne({ email: decodedFirebase.email.toLowerCase() });
                if (user) {
                    user.firebaseUid = decodedFirebase.uid;
                    if (decodedFirebase.email_verified && !user.emailVerified) {
                        user.emailVerified = true;
                        user.emailVerifiedAt = new Date();
                    }
                    await user.save();
                }
            }
            // If user does not exist in MongoDB, allow onboarding route, but block other routes
            if (!user) {
                if (req.path.endsWith('/onboarding') || req.path.endsWith('/sync-profile')) {
                    next();
                    return;
                }
                errorResponse(res, 'User profile not found. Please complete registration onboarding.', 404, {
                    code: 'PROFILE_NOT_FOUND',
                });
                return;
            }
            // Check account status
            if (user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
                errorResponse(res, 'Account is inactive or suspended. Please contact Grounds & Gates support.', 403, {
                    code: 'ACCOUNT_INACTIVE',
                });
                return;
            }
            // Sync verified email state from Firebase token if newer
            if (decodedFirebase.email_verified && !user.emailVerified) {
                user.emailVerified = true;
                user.emailVerifiedAt = new Date();
                await user.save();
            }
            req.user = {
                userId: user._id.toString(),
                firebaseUid: decodedFirebase.uid,
                email: user.email,
                role: user.role,
                emailVerified: Boolean(decodedFirebase.email_verified || user.emailVerified),
                accountStatus: user.accountStatus,
                tokenVersion: user.tokenVersion || 0,
            };
            next();
            return;
        }
        if (decodedLegacy) {
            // Legacy JWT fallback
            const user = await User.findById(decodedLegacy.userId).select('accountStatus tokenVersion role email emailVerified');
            if (!user || user.accountStatus !== 'active') {
                errorResponse(res, 'Account is inactive, suspended, or not found.', 403);
                return;
            }
            if (decodedLegacy.tokenVersion !== undefined && user.tokenVersion !== undefined && user.tokenVersion !== decodedLegacy.tokenVersion) {
                errorResponse(res, 'Session has been revoked. Please sign in again.', 401, { code: 'SESSION_REVOKED' });
                return;
            }
            req.user = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified,
                accountStatus: user.accountStatus,
                tokenVersion: user.tokenVersion,
            };
            next();
            return;
        }
        errorResponse(res, 'Invalid authentication state.', 401);
    }
    catch (err) {
        errorResponse(res, err.message || 'Authentication error', 500);
    }
};
/**
 * Route guard: Requires confirmed email verification on the backend
 */
export const requireEmailVerified = (req, res, next) => {
    if (!req.user?.emailVerified) {
        errorResponse(res, 'Please verify your email address via the link sent to your inbox to access this feature.', 403, {
            code: 'EMAIL_VERIFICATION_REQUIRED',
            requiresEmailVerification: true,
        });
        return;
    }
    next();
};
/**
 * Optional authentication for public routes that adapt when a user is signed in
 */
export const optionalAuthenticate = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            next();
            return;
        }
        try {
            const decodedFirebase = await firebaseAdmin.verifyIdToken(token, false);
            const user = await User.findOne({ firebaseUid: decodedFirebase.uid });
            if (user && user.accountStatus === 'active') {
                req.user = {
                    userId: user._id.toString(),
                    firebaseUid: decodedFirebase.uid,
                    email: user.email,
                    role: user.role,
                    emailVerified: Boolean(decodedFirebase.email_verified || user.emailVerified),
                    accountStatus: user.accountStatus,
                    tokenVersion: user.tokenVersion,
                };
            }
        }
        catch {
            try {
                const decodedLegacy = verifyAccessToken(token);
                const user = await User.findById(decodedLegacy.userId);
                if (user && user.accountStatus === 'active') {
                    req.user = {
                        userId: user._id.toString(),
                        email: user.email,
                        role: user.role,
                        emailVerified: user.emailVerified,
                        accountStatus: user.accountStatus,
                        tokenVersion: user.tokenVersion,
                    };
                }
            }
            catch { }
        }
    }
    catch { }
    next();
};
