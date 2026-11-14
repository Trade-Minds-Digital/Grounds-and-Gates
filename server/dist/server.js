import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { markSampleProvenance } from './database/provenance.js';
import { seedMastersAndContent } from './database/mastersMigration.js';
import { config } from './config/index.js';
const app = createApp();
const startServer = async () => {
    try {
        await connectDatabase();
        await markSampleProvenance();
        await seedMastersAndContent();
        const server = app.listen(config.port, () => {
            console.log(`🚀 Grounds & Gates REST API running on port ${config.port} (${config.env})`);
            console.log(`📡 Base API endpoint: http://localhost:${config.port}/api/v1`);
            console.log(`🩺 Health check: http://localhost:${config.port}/health`);
        });
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Gracefully shutting down Grounds & Gates API...`);
            server.close(async () => {
                await disconnectDatabase();
                console.log('✅ Server & Database connections closed safely.');
                process.exit(0);
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    catch (err) {
        console.error('❌ Failed to start Grounds & Gates API Server:', err);
        process.exit(1);
    }
};
startServer();
