import { Developer } from '../models/Developer.js';
import { INITIAL_DEMO_DEVELOPERS } from './data/developers.js';
import { slugify } from '../utils/slug.js';
export const seedDevelopers = async () => {
    console.log('🌱 Seeding Developers...');
    for (const dev of INITIAL_DEMO_DEVELOPERS) {
        await Developer.findOneAndUpdate({ referenceId: dev.id }, {
            referenceId: dev.id,
            name: dev.name,
            tamilName: dev.tamilName,
            slug: slugify(dev.name),
            logo: dev.logo,
            verified: dev.verified,
            rating: dev.rating,
            completedProjectsCount: dev.completedProjectsCount,
            experienceYears: dev.experienceYears,
            contactPhone: dev.contactPhone,
            email: dev.email,
            headquarters: dev.headquarters,
            description: dev.description,
            isActive: true,
            isSample: true,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_DEMO_DEVELOPERS.length} Developers.`);
};
