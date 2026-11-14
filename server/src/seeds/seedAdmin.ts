import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';

export const seedAdmin = async () => {
  console.log('🌱 Checking Super Administrator bootstrap configuration...');

  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@groundsandgates.com').toLowerCase().trim();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Admin@Grounds2026';
  const adminFullName = process.env.SUPER_ADMIN_NAME || process.env.ADMIN_NAME || 'Super Administrator';
  const adminMobile = process.env.SUPER_ADMIN_MOBILE || process.env.ADMIN_MOBILE || '+91 98422 71000';
  const isForce = process.argv.includes('--force');

  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await User.create({
      fullName: adminFullName,
      email: adminEmail,
      mobile: adminMobile,
      passwordHash,
      role: 'super-admin',
      accountStatus: 'active',
      emailVerified: true,
      phoneVerified: true,
    });
    console.log(`✅ First Super Administrator successfully bootstrapped: ${adminEmail} (Role: super-admin)`);
  } else if (isForce) {
    const salt = await bcrypt.genSalt(10);
    existing.passwordHash = await bcrypt.hash(adminPassword, salt);
    existing.fullName = adminFullName;
    existing.role = 'super-admin';
    existing.accountStatus = 'active';
    await existing.save();
    console.log(`✅ Super Administrator credentials updated via --force flag: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Super Administrator already initialized for ${adminEmail}. Account remains protected.`);
  }
};

// Allow standalone execution via `tsx server/src/seeds/seedAdmin.ts`
if (process.argv[1] && process.argv[1].includes('seedAdmin')) {
  (async () => {
    try {
      await connectDatabase();
      await seedAdmin();
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      console.error('Failed to bootstrap Super Admin:', err);
      process.exit(1);
    }
  })();
}

