import { Property } from '../models/Property.js';
import { Project } from '../models/Project.js';
import { Developer } from '../models/Developer.js';
import { INITIAL_PROPERTIES } from './data/properties.js';

export const seedProperties = async () => {
  console.log('🌱 Seeding Properties...');

  for (const p of INITIAL_PROPERTIES) {
    let projectId: string | undefined;
    if (p.id === 'gg-cbe-plot-01') projectId = 'proj-royal-gates-cbe';
    else if (p.id === 'gg-cbe-villa-01') projectId = 'proj-avinashi-villas-cbe';
    else if (p.id === 'gg-chn-apt-01') projectId = 'proj-omr-silicon-chn';
    else if (p.id === 'gg-pol-agri-01') projectId = 'proj-pollachi-canopy';
    else if (p.id === 'gg-oty-villa-03') projectId = 'proj-nilgiris-tea-estates';

    let projectDoc = null;
    let devDoc = null;
    if (projectId) {
      projectDoc = await Project.findOne({ referenceId: projectId });
      if (projectDoc) {
        devDoc = await Developer.findById(projectDoc.developer);
      }
    }

    await Property.findOneAndUpdate(
      { referenceId: p.id },
      {
        referenceId: p.id,
        slug: p.slug,
        title: p.title,
        tamilTitle: p.tamilTitle,
        description: p.description,
        tamilDescription: p.tamilDescription,
        category: p.category,
        listingType: p.listingType,
        ownershipType: p.ownershipType,
        price: p.price,
        priceUnit: p.priceUnit,
        negotiable: p.negotiable,
        plotArea: p.plotArea,
        plotAreaUnit: p.plotAreaUnit,
        builtUpArea: p.builtUpArea,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        facing: p.facing,
        roadWidthFeet: p.roadWidthFeet,
        address: p.address,
        district: p.district,
        city: p.location,
        locality: p.location,
        pincode: p.pincode,
        state: p.state || 'Tamil Nadu',
        coordinates: p.mapCoordinates,
        landmark: p.landmark,
        images: p.images,
        amenities: p.amenities,
        nearbyFacilities: p.nearbyFacilities,
        seller: p.seller,
        project: projectDoc ? projectDoc._id : undefined,
        projectId,
        developer: devDoc ? devDoc._id : undefined,
        approvalAuthority: p.approvalAuthority,
        dtcpApproved: p.approvalAuthority === 'DTCP' || p.approvalAuthority === 'RERA',
        cmdaApproved: p.approvalAuthority === 'CMDA',
        reraId: p.reraId,
        waterSource: p.waterSource,
        electricitySupply: p.electricitySupply,
        status: p.status,
        availability: p.status === 'sold' ? 'sold' : p.status === 'under-negotiation' ? 'reserved' : 'available',
        verified: Boolean((p.reraId && p.reraId.trim().length > 0) || (p.approvalAuthority && ['DTCP', 'CMDA', 'RERA'].includes(p.approvalAuthority) && p.ownershipType === 'company')),
        featured: p.featured,
        published: true,
        isSample: true,
        viewsCount: p.viewsCount || 250,
        enquiriesCount: p.enquiriesCount || 10,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`✅ Seeded ${INITIAL_PROPERTIES.length} Properties.`);
};
