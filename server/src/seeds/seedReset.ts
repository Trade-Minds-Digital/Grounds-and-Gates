import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import mongoose from 'mongoose';
import { runSeed } from './seed.js';

export const resetAndSeed = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: seed:reset is forbidden in production environments.');
    process.exit(1);
  }

  console.log('⚠️ RESETTING Grounds & Gates database for staging/development...');
  await connectDatabase();

  try {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const coll of collections) {
        await coll.deleteMany({});
        console.log(`🧹 Cleared collection: ${coll.collectionName}`);
      }
    }
    console.log('✅ All collections cleared. Re-seeding fresh data...');
  } catch (err: any) {
    console.error('❌ Failed to clear database:', err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }

  await runSeed();
};

resetAndSeed();
