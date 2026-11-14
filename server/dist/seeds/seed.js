import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import { seedRolesAndPermissions } from './seedRoles.js';
import { seedAdmin } from './seedAdmin.js';
import { seedDevelopers } from './seedDevelopers.js';
import { seedProjects } from './seedProjects.js';
import { seedEmployees } from './seedEmployees.js';
import { seedCustomers } from './seedCustomers.js';
import { seedProperties } from './seedProperties.js';
import { seedLeads } from './seedLeads.js';
import { seedSiteVisits } from './seedSiteVisits.js';
import { seedBookings } from './seedBookings.js';
import { seedActivities } from './seedActivities.js';
import { seedNotifications } from './seedNotifications.js';
import { seedMastersAndContent } from '../database/mastersMigration.js';
export const runSeed = async (shouldDisconnect = true) => {
    console.log('🚀 Running Grounds & Gates Database Seeder...\n');
    await connectDatabase();
    try {
        await seedRolesAndPermissions();
        await seedAdmin();
        await seedDevelopers();
        await seedProjects();
        await seedEmployees();
        await seedCustomers();
        await seedProperties();
        await seedLeads();
        await seedSiteVisits();
        await seedBookings();
        await seedActivities();
        await seedNotifications();
        await seedMastersAndContent();
        console.log('\n🌟 Database seeding completed successfully!');
    }
    catch (err) {
        console.error('❌ Error during seeding:', err);
        throw err;
    }
    finally {
        if (shouldDisconnect) {
            await disconnectDatabase();
        }
    }
};
const isMainModule = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');
if (isMainModule) {
    runSeed().catch(() => process.exit(1));
}
