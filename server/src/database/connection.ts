import mongoose from 'mongoose';
import { config } from '../config/index.js';

let mongodInstance: any = null;

export const connectDatabase = async (overrideUri?: string): Promise<typeof mongoose> => {
  const defaultTestUri = 'mongodb://127.0.0.1:27017/grounds_and_gates_test';
  const targetUri = overrideUri || (process.env.NODE_ENV === 'test' ? defaultTestUri : config.mongodbUri);

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log(`========================================================`);
    console.log(`🍃 MONGODB CONNECTION ESTABLISHED SUCCESSFULLY`);
    console.log(`   URI: ${targetUri}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (Connected)`);
    console.log(`   Host: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`========================================================`);

    return conn;
  } catch (err: any) {
    // Explicit Guard: In-memory database fallback is restricted ONLY to explicit test suites
    // or when explicitly enabled with ALLOW_MEMORY_DB=true. NEVER runs in production.
    const isTestOrExplicitMemory = (process.env.NODE_ENV === 'test' || process.env.ALLOW_MEMORY_DB === 'true') && config.env !== 'production';

    if (isTestOrExplicitMemory) {
      console.warn(`========================================================`);
      console.warn(`⚠️  MONGODB (target: ${targetUri}) UNREACHABLE: ${err.message}`);
      console.warn(`   ALLOW_MEMORY_DB is active: Booting isolated ephemeral test database...`);
      console.warn(`========================================================`);

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!mongodInstance) {
          mongodInstance = await MongoMemoryServer.create();
        }
        const memoryUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memoryUri);

        console.log(`========================================================`);
        console.log(`🍃 EPHEMERAL TEST DATABASE ACTIVE`);
        console.log(`   URI: ${memoryUri}`);
        console.log(`   Database Name: ${conn.connection.name}`);
        console.log(`========================================================`);

        return conn;
      } catch (memErr: any) {
        console.error(`Failed to boot ephemeral test MongoDB:`, memErr);
      }
    }

    console.error(`========================================================`);
    console.error(`❌ CRITICAL ERROR: FAILED TO CONNECT TO MONGODB`);
    console.error(`   Target URI: ${targetUri}`);
    console.error(`   Error Message: ${err.message}`);
    console.error(`--------------------------------------------------------`);
    console.error(`Setup & Troubleshooting Instructions:`);
    console.error(`1. Check whether MongoDB Community Server is installed.`);
    console.error(`2. Ensure Windows Service 'MongoDB Server (MongoDB)' is running:`);
    console.error(`   PowerShell: Get-Service MongoDB | Start-Service`);
    console.error(`3. Confirm port 27017 is accessible on 127.0.0.1.`);
    console.error(`4. Check MongoDB Compass connection: ${targetUri}`);
    console.error(`========================================================`);

    throw new Error(
      `MongoDB connection failed to '${targetUri}'. Ensure MongoDB Community Server is running. (${err.message})`
    );
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
};
