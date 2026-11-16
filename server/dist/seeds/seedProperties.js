import { Property } from '../models/Property.js';
import { Project } from '../models/Project.js';
import { Developer } from '../models/Developer.js';
import { INITIAL_PROPERTIES } from './data/properties.js';
// Real-world Tamil Nadu locality coordinates for accurate geospatial discovery
const KNOWN_LOCALITY_COORDINATES = {
    saravanampatti: { lat: 11.0827, lng: 76.9961 },
    vadavalli: { lat: 11.0268, lng: 76.9048 },
    peelamedu: { lat: 11.0265, lng: 77.0125 },
    gandhipuram: { lat: 11.0168, lng: 76.9678 },
    kalapatti: { lat: 11.0734, lng: 77.0396 },
    kinathukadavu: { lat: 10.8211, lng: 77.0194 },
    'race course': { lat: 11.0016, lng: 76.9736 },
    'avinashi road': { lat: 11.0289, lng: 77.0250 },
    sholinganallur: { lat: 12.8996, lng: 80.2279 },
    perungudi: { lat: 12.9654, lng: 80.2461 },
    guindy: { lat: 13.0067, lng: 80.2026 },
    'anna nagar': { lat: 13.0850, lng: 80.2101 },
    'west tambaram': { lat: 12.9249, lng: 80.1000 },
    tambaram: { lat: 12.9249, lng: 80.1000 },
    ecr: { lat: 12.8456, lng: 80.2412 },
    omr: { lat: 12.9150, lng: 80.2280 },
    'kk nagar': { lat: 9.9252, lng: 78.1498 },
    othakadai: { lat: 9.9678, lng: 78.1889 },
    thirunagar: { lat: 9.8780, lng: 78.0750 },
    'vaigai basin': { lat: 9.9120, lng: 78.1200 },
    coonoor: { lat: 11.3530, lng: 76.7959 },
    kotagiri: { lat: 11.4239, lng: 76.8665 },
    ooty: { lat: 11.4102, lng: 76.6950 },
    pollachi: { lat: 10.6609, lng: 77.0048 },
    'pollachi road': { lat: 10.8211, lng: 77.0194 },
    fairlands: { lat: 11.6780, lng: 78.1380 },
    'thillai nagar': { lat: 10.8281, lng: 78.6868 },
    mathigiri: { lat: 12.7119, lng: 77.8384 },
    hosur: { lat: 12.7409, lng: 77.8253 },
    'bagalur road': { lat: 12.7480, lng: 77.8350 },
    avinashi: { lat: 11.1931, lng: 77.2691 },
    perundurai: { lat: 11.2758, lng: 77.5828 },
    'palladam road': { lat: 11.0500, lng: 77.3000 },
};
export const seedProperties = async () => {
    console.log('🌱 Seeding Properties...');
    for (const p of INITIAL_PROPERTIES) {
        let projectId;
        if (p.id === 'gg-cbe-plot-01')
            projectId = 'proj-royal-gates-cbe';
        else if (p.id === 'gg-cbe-villa-01')
            projectId = 'proj-avinashi-villas-cbe';
        else if (p.id === 'gg-chn-apt-01')
            projectId = 'proj-omr-silicon-chn';
        else if (p.id === 'gg-pol-agri-01')
            projectId = 'proj-pollachi-canopy';
        else if (p.id === 'gg-oty-villa-03')
            projectId = 'proj-nilgiris-tea-estates';
        let projectDoc = null;
        let devDoc = null;
        if (projectId) {
            projectDoc = await Project.findOne({ referenceId: projectId });
            if (projectDoc) {
                devDoc = await Developer.findById(projectDoc.developer);
            }
        }
        const locKey = (p.location || '').toLowerCase().trim();
        let coords = p.mapCoordinates;
        if (!coords && KNOWN_LOCALITY_COORDINATES[locKey]) {
            coords = KNOWN_LOCALITY_COORDINATES[locKey];
        }
        const locationGeo = coords
            ? {
                type: 'Point',
                coordinates: [coords.lng, coords.lat],
            }
            : undefined;
        await Property.findOneAndUpdate({ referenceId: p.id }, {
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
            coordinates: coords,
            locationGeo,
            locationConfirmed: Boolean(coords),
            locationConfirmedAt: coords ? new Date() : undefined,
            locationSource: coords ? 'geocoded' : 'manual',
            isApproximateLocation: false,
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
            publishingStatus: 'published',
            isSample: false,
            viewsCount: p.viewsCount || 250,
            enquiriesCount: p.enquiriesCount || 10,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_PROPERTIES.length} Properties.`);
};
