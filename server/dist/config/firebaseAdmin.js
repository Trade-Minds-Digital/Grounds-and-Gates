import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './index.js';
let firebaseAdminApp = null;
let isConfigured = false;
let verifiedProjectId = null;
const mockUsers = new Map();
export function initFirebaseAdmin() {
    if (firebaseAdminApp)
        return firebaseAdminApp;
    const existingApps = getApps();
    if (existingApps.length > 0) {
        firebaseAdminApp = existingApps[0];
        isConfigured = true;
        return firebaseAdminApp;
    }
    // 1. If emulator host is specified
    if (config.firebase.emulatorHost) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = config.firebase.emulatorHost;
    }
    // 2. Discover and configure GOOGLE_APPLICATION_CREDENTIALS path
    const candidateCredPaths = [
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        config.firebase.credentialsPath,
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(process.cwd(), 'server/serviceAccountKey.json'),
        path.resolve(process.cwd(), '../serviceAccountKey.json'),
    ].filter(Boolean);
    let resolvedCredentialsFile = null;
    for (const candidate of candidateCredPaths) {
        const absPath = path.isAbsolute(candidate) ? candidate : path.resolve(process.cwd(), candidate);
        if (fs.existsSync(absPath)) {
            resolvedCredentialsFile = absPath;
            break;
        }
    }
    if (resolvedCredentialsFile) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedCredentialsFile;
        // Confirm the credential belongs to project grounds-and-gates without printing private keys
        try {
            const credContent = JSON.parse(fs.readFileSync(resolvedCredentialsFile, 'utf8'));
            verifiedProjectId = credContent.project_id || config.firebase.projectId || 'grounds-and-gates';
            if (verifiedProjectId === 'grounds-and-gates') {
                console.log(`[FirebaseAdmin] Verified credential belongs to expected project: "${verifiedProjectId}" (${credContent.client_email || 'service-account'})`);
            }
            else {
                console.warn(`[FirebaseAdmin] Warning: Credential project "${verifiedProjectId}" does not match "grounds-and-gates"`);
            }
        }
        catch (parseErr) {
            console.warn(`[FirebaseAdmin] Notice checking service account json: ${parseErr.message}`);
        }
        try {
            firebaseAdminApp = initializeApp({
                credential: applicationDefault(),
                projectId: verifiedProjectId || config.firebase.projectId || 'grounds-and-gates',
            });
            isConfigured = true;
            console.log('[FirebaseAdmin] Successfully initialized Firebase Admin using applicationDefault()');
            return firebaseAdminApp;
        }
        catch (err) {
            console.warn(`[FirebaseAdmin] Failed initializing with applicationDefault(): ${err.message}`);
        }
    }
    // 3. Fallback: If explicit client email and private key are in environment variables
    if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
        try {
            firebaseAdminApp = initializeApp({
                credential: cert({
                    projectId: config.firebase.projectId,
                    clientEmail: config.firebase.clientEmail,
                    privateKey: config.firebase.privateKey,
                }),
                projectId: config.firebase.projectId,
            });
            isConfigured = true;
            verifiedProjectId = config.firebase.projectId;
            console.log(`[FirebaseAdmin] Initialized for project "${config.firebase.projectId}" with Service Account cert`);
            return firebaseAdminApp;
        }
        catch (err) {
            console.warn(`[FirebaseAdmin] Failed to initialize with cert credentials: ${err.message}`);
        }
    }
    // 4. In test environment or unconfigured development: support test double
    if (config.env === 'test' || !config.firebase.projectId) {
        console.warn('[FirebaseAdmin] Running with local/test authentication double.');
    }
    return null;
}
export const firebaseAdmin = {
    getApp: () => {
        if (!firebaseAdminApp) {
            initFirebaseAdmin();
        }
        return firebaseAdminApp;
    },
    getAuthInstance: () => {
        const app = firebaseAdmin.getApp();
        if (app && isConfigured) {
            return getAuth(app);
        }
        return null;
    },
    isConfigured: () => isConfigured,
    /**
     * Verify Firebase ID Token with optional revocation check
     */
    async verifyIdToken(idToken, checkRevoked = true) {
        // 1. Test double / emulator fallback for deterministic unit & integration tests
        if (idToken.startsWith('test_token_')) {
            // Format: test_token_<uid>_<emailBase64>_<emailVerified: 0|1>
            // Strip 'test_token_' prefix; uid might contain underscores
            const rest = idToken.slice('test_token_'.length);
            const lastUnderscore = rest.lastIndexOf('_');
            const secondLastUnderscore = rest.lastIndexOf('_', lastUnderscore - 1);
            let uid = 'test_uid';
            let email = 'test@example.com';
            let emailVerified = false;
            if (lastUnderscore !== -1 && secondLastUnderscore !== -1) {
                uid = rest.slice(0, secondLastUnderscore);
                const emailB64 = rest.slice(secondLastUnderscore + 1, lastUnderscore);
                const emailVerifiedStr = rest.slice(lastUnderscore + 1);
                try {
                    email = emailB64 ? Buffer.from(emailB64, 'base64').toString('utf8') : 'test@example.com';
                }
                catch {
                    email = 'test@example.com';
                }
                emailVerified = emailVerifiedStr === '1';
            }
            else {
                uid = rest;
            }
            const user = mockUsers.get(uid);
            if (user && user.disabled) {
                const error = new Error('The user account has been disabled.');
                error.code = 'auth/user-disabled';
                throw error;
            }
            if (user && checkRevoked && user.tokensRevokedAt && user.tokensRevokedAt > Date.now() - 1000) {
                const error = new Error('The Firebase ID token has been revoked.');
                error.code = 'auth/id-token-revoked';
                throw error;
            }
            return {
                uid,
                email,
                email_verified: emailVerified,
                auth_time: Math.floor(Date.now() / 1000),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
                aud: config.firebase.projectId || 'grounds-and-gates',
                iss: `https://securetoken.google.com/${config.firebase.projectId || 'grounds-and-gates'}`,
                sub: uid,
                firebase: { identities: { email: [email] }, sign_in_provider: 'password' },
            };
        }
        // 2. Real Firebase ID token verification using live Firebase Admin SDK
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            return auth.verifyIdToken(idToken, checkRevoked);
        }
        // If live credentials are missing and token is not a recognized test token
        const error = new Error('Firebase Admin SDK is not configured with valid service account credentials.');
        error.code = 'auth/configuration-missing';
        throw error;
    },
    /**
     * Revoke active sessions / refresh tokens for a user
     */
    async revokeRefreshTokens(uid) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            await auth.revokeRefreshTokens(uid);
            return;
        }
        const mockUser = mockUsers.get(uid);
        if (mockUser) {
            mockUser.tokensRevokedAt = Date.now();
        }
    },
    /**
     * Create a Firebase user account via Admin SDK (e.g. for staff provisioning)
     */
    async createUser(params) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            return auth.createUser({
                email: params.email,
                password: params.password,
                displayName: params.displayName,
                emailVerified: params.emailVerified ?? false,
                disabled: params.disabled ?? false,
            });
        }
        // Mock double
        const uid = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const mockRecord = {
            uid,
            email: params.email.toLowerCase(),
            displayName: params.displayName,
            emailVerified: params.emailVerified ?? false,
            disabled: params.disabled ?? false,
        };
        mockUsers.set(uid, mockRecord);
        return {
            uid,
            email: mockRecord.email,
            displayName: mockRecord.displayName,
            emailVerified: mockRecord.emailVerified,
            disabled: mockRecord.disabled,
            metadata: {
                creationTime: new Date().toUTCString(),
                lastSignInTime: new Date().toUTCString(),
                toJSON: () => ({}),
            },
            providerData: [],
            toJSON: () => mockRecord,
        };
    },
    /**
     * Look up a Firebase user by UID
     */
    async getUser(uid) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            try {
                return await auth.getUser(uid);
            }
            catch (err) {
                if (err.code === 'auth/user-not-found')
                    return null;
                throw err;
            }
        }
        const mock = mockUsers.get(uid);
        if (!mock)
            return null;
        return {
            uid: mock.uid,
            email: mock.email,
            displayName: mock.displayName,
            emailVerified: mock.emailVerified,
            disabled: mock.disabled,
            metadata: { creationTime: new Date().toUTCString(), lastSignInTime: '', toJSON: () => ({}) },
            providerData: [],
            toJSON: () => mock,
        };
    },
    /**
     * Update a Firebase user account (e.g. disable on deactivation)
     */
    async updateUser(uid, properties) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            await auth.updateUser(uid, properties);
            return;
        }
        const mock = mockUsers.get(uid);
        if (mock) {
            if (properties.disabled !== undefined)
                mock.disabled = properties.disabled;
            if (properties.email)
                mock.email = properties.email;
            if (properties.emailVerified !== undefined)
                mock.emailVerified = properties.emailVerified;
            if (properties.displayName)
                mock.displayName = properties.displayName;
        }
    },
    /**
     * Delete a Firebase user (rollback on provisioning failure)
     */
    async deleteUser(uid) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            await auth.deleteUser(uid);
            return;
        }
        mockUsers.delete(uid);
    },
    /**
     * Generate an email verification link
     */
    async generateEmailVerificationLink(email) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            return auth.generateEmailVerificationLink(email);
        }
        return `${config.appUrl}/auth/action?mode=verifyEmail&oobCode=mock_oob_${Date.now()}`;
    },
    /**
     * Generate a password reset link
     */
    async generatePasswordResetLink(email) {
        const auth = firebaseAdmin.getAuthInstance();
        if (auth && isConfigured) {
            return auth.generatePasswordResetLink(email);
        }
        return `${config.appUrl}/auth/action?mode=resetPassword&oobCode=mock_reset_${Date.now()}`;
    },
    /**
     * Helper to register mock user for tests
     */
    registerMockUser(user) {
        mockUsers.set(user.uid, user);
    },
    /**
     * Helper to clear mock users in tests
     */
    clearMockUsers() {
        mockUsers.clear();
    },
};
// Initialize on module load
initFirebaseAdmin();
