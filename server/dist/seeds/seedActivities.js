import { Activity } from '../models/Activity.js';
import { INITIAL_DEMO_ACTIVITIES } from './data/activities.js';
export const seedActivities = async () => {
    console.log('🌱 Seeding Activities...');
    for (const a of INITIAL_DEMO_ACTIVITIES) {
        await Activity.findOneAndUpdate({ referenceId: a.id }, {
            referenceId: a.id,
            entityType: a.entityType,
            entityId: a.entityId,
            type: a.type,
            title: a.title,
            description: a.description,
            timestamp: a.timestamp,
            performedBy: a.performedBy,
            performedByEmployeeId: a.performedByEmployeeId,
            isSample: true,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_DEMO_ACTIVITIES.length} Activities.`);
};
