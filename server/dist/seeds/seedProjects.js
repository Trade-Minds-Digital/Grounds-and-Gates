import { Project } from '../models/Project.js';
import { Developer } from '../models/Developer.js';
import { INITIAL_DEMO_PROJECTS } from './data/projects.js';
import { slugify } from '../utils/slug.js';
export const seedProjects = async () => {
    console.log('🌱 Seeding Projects...');
    for (const proj of INITIAL_DEMO_PROJECTS) {
        const dev = await Developer.findOne({ referenceId: proj.developerId });
        if (!dev)
            continue;
        await Project.findOneAndUpdate({ referenceId: proj.id }, {
            referenceId: proj.id,
            developer: dev._id,
            developerId: dev.referenceId,
            name: proj.name,
            tamilName: proj.tamilName,
            slug: slugify(proj.name),
            district: proj.district,
            locality: proj.locality,
            status: proj.status,
            completionYear: proj.completionYear,
            reraNumber: proj.reraNumber,
            approvalAuthority: proj.approvalAuthority,
            totalUnits: proj.totalUnits,
            availableUnits: proj.availableUnits,
            priceRange: proj.priceRange,
            gallery: proj.images,
            description: proj.description,
            isActive: true,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_DEMO_PROJECTS.length} Projects.`);
};
