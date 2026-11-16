import { User } from '../models/User.js';
import { config } from '../config/index.js';

export interface FirebaseMigrationReport {
  dryRun: boolean;
  totalUsers: number;
  firebaseMappedCount: number;
  firebaseUnmappedCount: number;
  superAdminsCount: number;
  staffUsersCount: number;
  publicUsersCount: number;
  verifiedUsersCount: number;
  pendingVerificationCount: number;
  updatedUsersCount: number;
  passwordHashAlgorithm: string;
  supportedFirebaseImportFormat: string;
  superAdminDetails: {
    email: string;
    hasFirebaseUid: boolean;
    isVerified: boolean;
    isActive: boolean;
  };
  unmappedUsers: Array<{
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    hasPasswordHash: boolean;
  }>;
  timestamp: string;
}

export async function runLegacyUsersMigration(options: { dryRun?: boolean } = {}): Promise<FirebaseMigrationReport> {
  const dryRun = options.dryRun ?? true;
  const staffRoles = [
    'super-admin',
    'admin',
    'employee',
    'sales-manager',
    'sales-executive',
    'listing-manager',
  ];

  const allUsers = await User.find({}).select('+passwordHash');
  let superAdminsCount = 0;
  let staffUsersCount = 0;
  let publicUsersCount = 0;
  let verifiedUsersCount = 0;
  let pendingVerificationCount = 0;
  let updatedUsersCount = 0;
  let firebaseMappedCount = 0;
  let firebaseUnmappedCount = 0;

  const superAdminEmail = (config.admin.email || 'admin@groundsandgates.com').toLowerCase();
  let superAdminDetails = {
    email: superAdminEmail,
    hasFirebaseUid: false,
    isVerified: true,
    isActive: true,
  };

  const unmappedUsers: Array<{
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    hasPasswordHash: boolean;
  }> = [];

  for (const user of allUsers) {
    let modified = false;
    const isSuperAdmin = user.role === 'super-admin' || user.email.toLowerCase() === superAdminEmail;
    const isStaff = staffRoles.includes(user.role);

    if (user.firebaseUid) {
      firebaseMappedCount++;
    } else {
      firebaseUnmappedCount++;
      unmappedUsers.push({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPasswordHash: Boolean(user.passwordHash),
      });
    }

    if (isSuperAdmin) {
      superAdminsCount++;
      superAdminDetails = {
        email: user.email,
        hasFirebaseUid: Boolean(user.firebaseUid),
        isVerified: user.emailVerified,
        isActive: user.accountStatus === 'active',
      };
      // Guarantee Super Admin protection
      if (!user.emailVerified || user.accountStatus !== 'active') {
        if (!dryRun) {
          user.emailVerified = true;
          user.accountStatus = 'active';
          user.emailVerifiedAt = user.emailVerifiedAt || new Date();
          modified = true;
        }
      }
    } else if (isStaff) {
      staffUsersCount++;
      if (user.emailVerified === false && user.accountStatus === 'active') {
        if (!dryRun) {
          user.emailVerified = true;
          user.emailVerifiedAt = user.emailVerifiedAt || user.createdAt || new Date();
          modified = true;
        }
      }
    } else {
      // Public user
      publicUsersCount++;
      if (!user.accountUsage) {
        if (!dryRun) {
          user.accountUsage =
            user.role === 'seller' || user.role === 'developer' || user.role === 'agent'
              ? 'seller'
              : 'buyer';
          modified = true;
        }
      }

      if (!user.consents || user.consents.termsAccepted === undefined) {
        if (!dryRun) {
          user.consents = {
            termsAccepted: true,
            termsAcceptedAt: user.createdAt || new Date(),
            termsPolicyVersion: 'legacy-migrated',
            marketingConsent: false,
          };
          modified = true;
        }
      }
    }

    if (user.emailVerified) {
      verifiedUsersCount++;
    } else {
      pendingVerificationCount++;
    }

    if (modified && !dryRun) {
      await user.save();
      updatedUsersCount++;
    }
  }

  return {
    dryRun,
    totalUsers: allUsers.length,
    firebaseMappedCount,
    firebaseUnmappedCount,
    superAdminsCount,
    staffUsersCount,
    publicUsersCount,
    verifiedUsersCount,
    pendingVerificationCount,
    updatedUsersCount,
    passwordHashAlgorithm: 'bcrypt (salt rounds 10, prefix $2a$ / $2b$)',
    supportedFirebaseImportFormat: 'BCRYPT via Firebase Admin SDK importUsers({ hash: { algorithm: "BCRYPT" } })',
    superAdminDetails,
    unmappedUsers: unmappedUsers.slice(0, 50), // Sample for audit review
    timestamp: new Date().toISOString(),
  };
}
