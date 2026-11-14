import { Notification } from '../models/Notification.js';
import { INITIAL_DEMO_NOTIFICATIONS } from './data/notifications.js';
export const seedNotifications = async () => {
    console.log('🌱 Seeding Notifications...');
    for (const n of INITIAL_DEMO_NOTIFICATIONS) {
        await Notification.findOneAndUpdate({ referenceId: n.id }, {
            referenceId: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            timestamp: n.timestamp,
            actionView: n.actionView,
            isSample: true,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_DEMO_NOTIFICATIONS.length} Notifications.`);
};
