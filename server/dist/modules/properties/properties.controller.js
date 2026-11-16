import { Property } from '../../models/Property.js';
import { AuditLog } from '../../models/AuditLog.js';
import { slugify } from '../../utils/slug.js';
import { successResponse, errorResponse } from '../../utils/response.js';
// Haversine formula to calculate straight-line geographic distance between two points in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
export const getProperties = async (req, res) => {
    try {
        const { searchQuery, category, district, locality, listingType, ownershipType, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, facing, featuredOnly, includeSample, nearLat, nearLng, radius, bbox, locationStatus, page = '1', limit = '12', sortBy = 'newest', } = req.query;
        const filter = {
            published: true,
            publishingStatus: 'published',
        };
        // Reversible sample record exclusion: live responses exclude sample fixtures unless explicitly requested
        if (includeSample !== 'true') {
            filter.isSample = { $ne: true };
        }
        // Text search query
        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.trim();
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { locality: { $regex: q, $options: 'i' } },
                { district: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (district && district !== 'All' && district !== 'all') {
            filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
        }
        if (locality && locality !== 'all') {
            filter.locality = { $regex: new RegExp(locality, 'i') };
        }
        if (listingType && listingType !== 'all') {
            filter.listingType = listingType;
        }
        if (ownershipType && ownershipType !== 'all') {
            filter.ownershipType = ownershipType;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        if (minArea || maxArea) {
            filter.plotArea = {};
            if (minArea)
                filter.plotArea.$gte = Number(minArea);
            if (maxArea)
                filter.plotArea.$lte = Number(maxArea);
        }
        if (bedrooms && bedrooms !== 'all') {
            filter.bedrooms = Number(bedrooms);
        }
        if (bathrooms && bathrooms !== 'all') {
            filter.bathrooms = Number(bathrooms);
        }
        if (facing && facing !== 'all') {
            filter.facing = facing;
        }
        if (featuredOnly === 'true') {
            filter.featured = true;
        }
        // Geospatial Radius Filter: center coordinates + radius (in km)
        let parsedNearLat = null;
        let parsedNearLng = null;
        if (nearLat && nearLng) {
            const lat = parseFloat(nearLat);
            const lng = parseFloat(nearLng);
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                parsedNearLat = lat;
                parsedNearLng = lng;
                const radiusKm = Math.min(100, Math.max(0.5, parseFloat(radius || '10')));
                // In MongoDB $centerSphere: [ [longitude, latitude], radiusInRadians ]
                // Earth radius = 6378.1 km
                filter.locationGeo = {
                    $geoWithin: {
                        $centerSphere: [[lng, lat], radiusKm / 6378.1],
                    },
                };
            }
        }
        else if (bbox) {
            // Bounding box filter: [minLng, minLat, maxLng, maxLat]
            const parts = bbox.split(',').map(Number);
            if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
                const [minLng, minLat, maxLng, maxLat] = parts;
                filter.locationGeo = {
                    $geoWithin: {
                        $box: [
                            [minLng, minLat],
                            [maxLng, maxLat],
                        ],
                    },
                };
            }
        }
        // Location Status filter (for Admin / CRM inventory management)
        if (locationStatus === 'missing') {
            filter.$or = [
                { 'locationGeo.coordinates': { $exists: false } },
                { 'locationGeo.coordinates': { $size: 0 } },
                { locationConfirmed: false },
            ];
        }
        else if (locationStatus === 'confirmed') {
            filter['locationGeo.coordinates'] = { $exists: true, $ne: [] };
            filter.locationConfirmed = true;
        }
        // Sort order
        let sortOptions = { createdAt: -1 };
        if (sortBy === 'newest')
            sortOptions = { createdAt: -1 };
        else if (sortBy === 'price-low')
            sortOptions = { price: 1 };
        else if (sortBy === 'price-high')
            sortOptions = { price: -1 };
        else if (sortBy === 'area-low')
            sortOptions = { plotArea: 1 };
        else if (sortBy === 'area-high')
            sortOptions = { plotArea: -1 };
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;
        const [properties, total] = await Promise.all([
            Property.find(filter)
                .sort(sortBy === 'distance' ? { createdAt: -1 } : sortOptions)
                .skip(sortBy === 'distance' ? 0 : skip)
                .limit(sortBy === 'distance' ? 100 : limitNum)
                .populate('project', 'name reraNumber status')
                .populate('developer', 'name verified logo rating'),
            Property.countDocuments(filter),
        ]);
        const authReq = req;
        const isStaff = Boolean(authReq.user && ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(authReq.user.role));
        // Map properties to attach distance calculations & sanitize approximate location privacy
        let processed = properties.map((p) => {
            const obj = p.toObject();
            obj.id = obj.referenceId || obj._id?.toString() || obj.id;
            let pLat = obj.coordinates?.lat;
            let pLng = obj.coordinates?.lng;
            if (!pLat && obj.locationGeo?.coordinates) {
                pLng = obj.locationGeo.coordinates[0];
                pLat = obj.locationGeo.coordinates[1];
            }
            if (parsedNearLat !== null && parsedNearLng !== null && typeof pLat === 'number' && typeof pLng === 'number') {
                const distKm = calculateHaversineDistance(parsedNearLat, parsedNearLng, pLat, pLng);
                obj.distanceKm = Number(distKm.toFixed(2));
                obj.distanceLabel = `${distKm.toFixed(1)} km (Straight-line distance)`;
            }
            // Privacy: If approximate location is enabled, public responses obscure exact pinpoint
            if (obj.isApproximateLocation && !isStaff && typeof pLat === 'number' && typeof pLng === 'number') {
                obj.coordinates = {
                    lat: Number(pLat.toFixed(2)),
                    lng: Number(pLng.toFixed(2)),
                };
                if (obj.locationGeo?.coordinates) {
                    obj.locationGeo.coordinates = [Number(pLng.toFixed(2)), Number(pLat.toFixed(2))];
                }
            }
            return obj;
        });
        if (sortBy === 'distance' && parsedNearLat !== null && parsedNearLng !== null) {
            processed.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
            processed = processed.slice(skip, skip + limitNum);
        }
        const pages = Math.ceil(total / limitNum) || 1;
        successResponse(res, processed, 'Properties fetched successfully', 200, { total, page: pageNum, limit: limitNum, pages });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getMapMarkers = async (req, res) => {
    try {
        const { category, district, listingType, minPrice, maxPrice, nearLat, nearLng, radius, bbox, includeSample, } = req.query;
        const filter = {
            published: true,
            $or: [
                { publishingStatus: 'published' },
                { publishingStatus: { $exists: false } },
                { publishingStatus: null },
            ],
            $and: [
                {
                    $or: [
                        { 'locationGeo.coordinates': { $exists: true, $ne: [] } },
                        { 'coordinates.lat': { $exists: true, $ne: null } },
                    ],
                },
            ],
        };
        if (includeSample === 'false') {
            filter.isSample = { $ne: true };
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (district && district !== 'All' && district !== 'all') {
            filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
        }
        if (listingType && listingType !== 'all') {
            filter.listingType = listingType;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        if (nearLat && nearLng) {
            const parsedLat = parseFloat(nearLat);
            const parsedLng = parseFloat(nearLng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                const radiusKm = Math.min(100, Math.max(0.5, parseFloat(radius || '10')));
                filter.locationGeo = {
                    $geoWithin: {
                        $centerSphere: [[parsedLng, parsedLat], radiusKm / 6378.1],
                    },
                };
            }
        }
        else if (bbox) {
            const parts = bbox.split(',').map(Number);
            if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
                const [minLng, minLat, maxLng, maxLat] = parts;
                filter.locationGeo = {
                    $geoWithin: {
                        $box: [
                            [minLng, minLat],
                            [maxLng, maxLat],
                        ],
                    },
                };
            }
        }
        const markers = await Property.find(filter)
            .select('referenceId slug title tamilTitle category listingType price priceUnit coordinates locationGeo images locality district isApproximateLocation verified')
            .limit(300)
            .lean();
        const authReq = req;
        const isStaff = Boolean(authReq.user && ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(authReq.user.role));
        const sanitized = markers.map((m) => {
            let lat = m.coordinates?.lat;
            let lng = m.coordinates?.lng;
            if (!lat && m.locationGeo?.coordinates) {
                lng = m.locationGeo.coordinates[0];
                lat = m.locationGeo.coordinates[1];
            }
            // Privacy: if approximate location and not staff, round to 2 decimals
            if (m.isApproximateLocation && !isStaff && lat && lng) {
                lat = Number(lat.toFixed(2));
                lng = Number(lng.toFixed(2));
            }
            return {
                id: m.referenceId || m._id,
                slug: m.slug,
                title: m.title,
                tamilTitle: m.tamilTitle,
                category: m.category,
                listingType: m.listingType,
                price: m.price,
                priceUnit: m.priceUnit,
                locality: m.locality,
                district: m.district,
                image: m.images?.[0] || '',
                lat,
                lng,
                isApproximateLocation: Boolean(m.isApproximateLocation),
                verified: Boolean(m.verified),
            };
        }).filter((m) => typeof m.lat === 'number' && typeof m.lng === 'number');
        successResponse(res, sanitized, 'Map markers fetched successfully', 200, {
            total: sanitized.length,
            page: 1,
            limit: sanitized.length,
            pages: 1,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getPropertyByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const property = await Property.findOne({
            $or: [
                { slug: idOrSlug.toLowerCase() },
                { referenceId: idOrSlug },
                ...(idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: idOrSlug }] : []),
            ],
        })
            .populate('project')
            .populate('developer');
        if (!property) {
            errorResponse(res, 'Property not found', 404);
            return;
        }
        // Public Details Rule:
        // Strictly return only genuine published listings.
        // Keep drafts, pending-review, rejected, and archived listings private.
        const isPublished = property.published === true && property.publishingStatus === 'published';
        if (!isPublished) {
            errorResponse(res, 'Property listing is not currently published.', 404);
            return;
        }
        // Access rule: Exclude confirmed sample listings from public live views unless explicitly requested
        if (property.isSample && req.query.includeSample !== 'true') {
            errorResponse(res, 'Property not found.', 404);
            return;
        }
        // Increment views asynchronously
        property.viewsCount = (property.viewsCount || 0) + 1;
        await property.save();
        const propObj = property.toObject();
        propObj.id = propObj.referenceId || propObj._id?.toString() || propObj.id;
        // Access rule: Strip private legal documents from public responses
        if (propObj.legalDocuments) {
            propObj.legalDocuments = propObj.legalDocuments.filter((d) => !d.isPrivate);
        }
        successResponse(res, propObj);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
/**
 * Seller-scoped endpoint: returns unpublished or published listing for its owner
 */
export const getSellerPropertyByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        if (!req.user?.userId) {
            errorResponse(res, 'Authentication required.', 401);
            return;
        }
        const isStaff = ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(req.user.role);
        const property = await Property.findOne({
            $or: [
                { slug: idOrSlug.toLowerCase() },
                { referenceId: idOrSlug },
                ...(idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: idOrSlug }] : []),
            ],
        })
            .populate('project')
            .populate('developer');
        if (!property) {
            errorResponse(res, 'Property not found.', 404);
            return;
        }
        // Strictly owner-scoped:
        const isOwner = Boolean((property.createdBy && property.createdBy.toString() === req.user.userId.toString()) ||
            (property.ownerId && property.ownerId.toString() === req.user.userId.toString()) ||
            (property.seller?.email && req.user.email && property.seller.email.toLowerCase() === req.user.email.toLowerCase()));
        if (!isOwner && !isStaff) {
            errorResponse(res, 'Access denied. You can only access your own property listings.', 403);
            return;
        }
        const propObj = property.toObject();
        propObj.id = propObj.referenceId || propObj._id?.toString() || propObj.id;
        successResponse(res, propObj, 'Seller property retrieved successfully.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
/**
 * Seller listings endpoint: returns all listings owned by the authenticated seller
 */
export const getMySellerProperties = async (req, res) => {
    try {
        if (!req.user?.userId) {
            errorResponse(res, 'Authentication required.', 401);
            return;
        }
        const properties = await Property.find({
            $or: [
                { createdBy: req.user.userId },
                { ownerId: req.user.userId },
                ...(req.user.email ? [{ 'seller.email': req.user.email }] : []),
            ],
        })
            .sort({ updatedAt: -1 })
            .lean();
        const sanitized = properties.map((p) => ({
            ...p,
            id: p.referenceId || p._id?.toString() || p.id,
        }));
        successResponse(res, sanitized, 'Seller properties retrieved successfully.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
/**
 * Admin review endpoint: returns complete listing including private documents for authorized staff
 */
export const getAdminPropertyByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const property = await Property.findOne({
            $or: [
                { slug: idOrSlug.toLowerCase() },
                { referenceId: idOrSlug },
                ...(idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: idOrSlug }] : []),
            ],
        })
            .populate('project')
            .populate('developer')
            .populate('createdBy', 'fullName email mobile role');
        if (!property) {
            errorResponse(res, 'Property not found.', 404);
            return;
        }
        const propObj = property.toObject();
        propObj.id = propObj.referenceId || propObj._id?.toString() || propObj.id;
        successResponse(res, propObj, 'Property retrieved for administrative review.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
/**
 * Admin manage inventory endpoint: returns listings with optional publishingStatus filter
 */
export const getAdminProperties = async (req, res) => {
    try {
        const { searchQuery, category, district, publishingStatus, status, page = '1', limit = '100', } = req.query;
        const filter = {};
        if (publishingStatus && publishingStatus !== 'all') {
            filter.publishingStatus = publishingStatus;
        }
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (district && district !== 'all' && district !== 'All') {
            filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
        }
        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.trim();
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { referenceId: { $regex: q, $options: 'i' } },
                { locality: { $regex: q, $options: 'i' } },
                { district: { $regex: q, $options: 'i' } },
            ];
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
        const skip = (pageNum - 1) * limitNum;
        const [total, properties] = await Promise.all([
            Property.countDocuments(filter),
            Property.find(filter)
                .populate('createdBy', 'fullName email')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
        ]);
        const pages = Math.ceil(total / limitNum) || 1;
        successResponse(res, properties, 'Admin inventory retrieved successfully.', 200, {
            total,
            page: pageNum,
            limit: limitNum,
            pages,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
/**
 * Admin publication state transition endpoint
 */
export const updatePropertyPublishStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { publishingStatus, rejectionReason, notes } = req.body;
        if (!['published', 'pending-review', 'draft', 'rejected', 'archived'].includes(publishingStatus)) {
            errorResponse(res, 'Invalid publishing status.', 400);
            return;
        }
        const property = await Property.findOne({
            $or: [
                { referenceId: id },
                { slug: id.toLowerCase() },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!property) {
            errorResponse(res, 'Property not found.', 404);
            return;
        }
        const previousPublishingStatus = property.publishingStatus;
        const previousPublished = property.published;
        property.publishingStatus = publishingStatus;
        // Authoritative synchronization: published boolean is true ONLY when publishingStatus === 'published'
        property.published = publishingStatus === 'published';
        // If publishing, ensure status is active if it was pending-review
        if (publishingStatus === 'published' && property.status === 'pending-review') {
            property.status = 'active';
        }
        if (publishingStatus === 'rejected' && rejectionReason) {
            if (!property.verificationReview) {
                property.verificationReview = { status: 'rejected', notes: rejectionReason, supportingDocuments: [] };
            }
            else {
                property.verificationReview.status = 'rejected';
                property.verificationReview.notes = rejectionReason;
            }
        }
        property.updatedBy = req.user?.userId;
        await property.save();
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: publishingStatus === 'published' ? 'PROPERTY_PUBLISHED' : `PROPERTY_${publishingStatus.toUpperCase().replace(/-/g, '_')}`,
            module: 'PROPERTIES',
            entityId: property.referenceId,
            changes: {
                publishingStatus: { from: previousPublishingStatus, to: publishingStatus },
                published: { from: previousPublished, to: property.published },
                notes,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, property, `Property publication status updated to "${publishingStatus}".`);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const reviewPropertyVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, supportingDocuments } = req.body;
        if (!['verified', 'rejected'].includes(status)) {
            errorResponse(res, 'Verification status must be either verified or rejected.', 400);
            return;
        }
        const property = await Property.findOne({
            $or: [
                { referenceId: id },
                { slug: id.toLowerCase() },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!property) {
            errorResponse(res, 'Property not found.', 404);
            return;
        }
        property.verified = status === 'verified';
        property.verificationReview = {
            reviewedBy: req.user?.userId,
            reviewerEmail: req.user?.email,
            reviewedAt: new Date(),
            status,
            notes: notes || '',
            supportingDocuments: supportingDocuments || [],
        };
        await property.save();
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: status === 'verified' ? 'PROPERTY_VERIFIED' : 'PROPERTY_VERIFICATION_REJECTED',
            module: 'PROPERTIES',
            entityId: property.referenceId,
            changes: { verified: property.verified, notes },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, property, `Property review successfully marked as ${status}.`);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getMyDraftProperty = async (req, res) => {
    try {
        if (!req.user?.userId) {
            errorResponse(res, 'Authentication required', 401);
            return;
        }
        const draft = await Property.findOne({
            createdBy: req.user.userId,
            publishingStatus: 'draft',
        }).sort({ updatedAt: -1 });
        successResponse(res, draft, draft ? 'Draft retrieved successfully' : 'No active draft found');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const SELLER_WRITABLE_FIELDS = [
    'title',
    'tamilTitle',
    'description',
    'tamilDescription',
    'category',
    'propertyType',
    'listingType',
    'price',
    'priceUnit',
    'priceBasis',
    'negotiable',
    'deposit',
    'maintenanceFee',
    'maintenanceFrequency',
    'plotArea',
    'plotAreaUnit',
    'builtUpArea',
    'builtUpAreaUnit',
    'carpetArea',
    'superBuiltUpArea',
    'plotLength',
    'plotWidth',
    'roadWidthFeet',
    'roadType',
    'isCornerPlot',
    'isGatedLayout',
    'boundaryWall',
    'bedrooms',
    'bathrooms',
    'balconies',
    'floors',
    'floorNumber',
    'totalFloors',
    'facing',
    'furnishingStatus',
    'parkingSpaces',
    'parkingType',
    'hasLift',
    'landUseClassification',
    'irrigationSource',
    'cropType',
    'structuresOnLand',
    'soilType',
    'commercialSubtype',
    'powerLoadKw',
    'frontageFeet',
    'ceilingHeightFeet',
    'suitableUse',
    'constructionStatus',
    'possessionDate',
    'propertyAgeYears',
    'address',
    'district',
    'city',
    'locality',
    'pincode',
    'state',
    'landmark',
    'coordinates',
    'locationConfirmed',
    'locationSource',
    'isApproximateLocation',
    'images',
    'videos',
    'videoUrl',
    'videoType',
    'floorPlans',
    'amenities',
    'nearbyFacilities',
    'approvalAuthority',
    'approvalNumber',
    'reraId',
    'waterSource',
    'electricitySupply',
    'legalDocuments',
    'contactPreferences',
    'draftStep',
];
export const createProperty = async (req, res) => {
    try {
        const rawData = req.body;
        const isStaff = Boolean(req.user && ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(req.user.role));
        // Whitelist writable fields to prevent parameter injection
        const data = {};
        SELLER_WRITABLE_FIELDS.forEach((field) => {
            if (rawData[field] !== undefined) {
                data[field] = rawData[field];
            }
        });
        const isDraft = Boolean(rawData.isDraft || rawData.publishingStatus === 'draft');
        const referenceId = rawData.referenceId || `gg-${Date.now().toString(36).toLowerCase()}`;
        const cleanTitle = (data.title && data.title.trim()) || (isDraft ? 'Untitled Draft Listing' : 'Property Listing');
        const slug = rawData.slug || `${slugify(cleanTitle)}-${referenceId.slice(-6)}`;
        const description = data.description ||
            `${cleanTitle} located in ${data.locality || data.district || 'Tamil Nadu'}. Direct verified listing.`;
        const city = data.city || data.locality || data.district || 'Coimbatore';
        const district = data.district || 'Coimbatore';
        const locality = data.locality || city;
        const address = data.address || `${locality}, ${district}, Tamil Nadu`;
        const pincode = data.pincode || '641001';
        const plotArea = typeof data.plotArea === 'number' && data.plotArea >= 0 ? data.plotArea : (isDraft ? 0 : 1);
        const plotAreaUnit = data.plotAreaUnit || 'cents';
        const price = typeof data.price === 'number' && data.price >= 0 ? data.price : 0;
        const facing = data.facing || 'North';
        // Format seller info
        let seller;
        if (isStaff && rawData.seller) {
            seller = rawData.seller;
        }
        else {
            seller = {
                name: rawData.seller?.name || req.user?.email?.split('@')[0] || 'Property Owner',
                type: ['owner', 'agent', 'builder'].includes(rawData.seller?.type) ? rawData.seller.type : 'owner',
                phone: rawData.seller?.phone || '+91 98422 71000',
                email: rawData.seller?.email || req.user?.email || 'seller@groundsandgates.com',
                isCompanyRepresentative: false,
            };
        }
        const images = Array.isArray(data.images) && data.images.length > 0 ? data.images : [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
        ];
        // Staff vs Non-Staff Security Constraints
        let ownershipType = 'third-party';
        let verified = false;
        let isSample = false;
        let featured = false;
        let published = false;
        let publishingStatus = isDraft ? 'draft' : 'pending-review';
        if (isStaff) {
            ownershipType = rawData.ownershipType === 'company' ? 'company' : 'third-party';
            verified = rawData.verified !== undefined ? Boolean(rawData.verified) : true;
            isSample = Boolean(rawData.isSample);
            featured = Boolean(rawData.featured);
            published = isDraft ? false : (rawData.published !== undefined ? Boolean(rawData.published) : true);
            publishingStatus = isDraft ? 'draft' : (rawData.publishingStatus || 'published');
        }
        const newProperty = await Property.create({
            ...data,
            referenceId,
            slug,
            title: cleanTitle,
            description,
            category: data.category || 'residential-plots',
            listingType: data.listingType || 'buy',
            ownershipType,
            price,
            plotArea,
            plotAreaUnit,
            facing,
            address,
            district,
            city,
            locality,
            pincode,
            seller,
            images,
            createdBy: req.user?.userId,
            viewsCount: 0,
            enquiriesCount: 0,
            verified,
            isSample,
            featured,
            published,
            publishingStatus,
            status: isDraft ? 'pending-review' : 'active',
        });
        successResponse(res, newProperty, isDraft ? 'Draft saved successfully' : 'Property submitted successfully and is pending review', 201);
    }
    catch (err) {
        console.error('Property creation error:', err);
        errorResponse(res, err.message, 500);
    }
};
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const rawData = req.body;
        const isStaff = Boolean(req.user && ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(req.user.role));
        const property = await Property.findOne({
            $or: [
                { referenceId: id },
                { slug: id.toLowerCase() },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!property) {
            errorResponse(res, 'Property not found', 404);
            return;
        }
        // Ownership check for non-staff users
        if (!isStaff) {
            const isOwner = property.createdBy && req.user?.userId && property.createdBy.toString() === req.user.userId.toString();
            if (!isOwner) {
                errorResponse(res, 'Access denied. You can only modify your own property listings.', 403);
                return;
            }
        }
        // Filter fields according to permissions
        const updateData = {};
        SELLER_WRITABLE_FIELDS.forEach((field) => {
            if (rawData[field] !== undefined) {
                updateData[field] = rawData[field];
            }
        });
        // Handle publishing status and drafts
        const isDraft = Boolean(rawData.isDraft || rawData.publishingStatus === 'draft');
        if (isDraft) {
            updateData.publishingStatus = 'draft';
            updateData.published = false;
        }
        else if (!isStaff) {
            // If a non-staff seller updates an existing listing or submits a draft for review:
            updateData.publishingStatus = 'pending-review';
            updateData.published = false;
            // Protected badges cannot be elevated by non-staff
            delete updateData.verified;
            delete updateData.isSample;
            delete updateData.featured;
            delete updateData.ownershipType;
        }
        else {
            // Staff updates
            if (rawData.verified !== undefined)
                updateData.verified = Boolean(rawData.verified);
            if (rawData.isSample !== undefined)
                updateData.isSample = Boolean(rawData.isSample);
            if (rawData.featured !== undefined)
                updateData.featured = Boolean(rawData.featured);
            if (rawData.ownershipType)
                updateData.ownershipType = rawData.ownershipType;
            if (rawData.publishingStatus)
                updateData.publishingStatus = rawData.publishingStatus;
            if (rawData.published !== undefined)
                updateData.published = Boolean(rawData.published);
        }
        Object.assign(property, updateData);
        property.updatedBy = req.user?.userId;
        if (rawData.locationConfirmed) {
            property.locationConfirmed = true;
            property.locationConfirmedAt = new Date();
        }
        await property.save();
        successResponse(res, property, isDraft ? 'Draft updated successfully' : 'Property updated successfully and submitted for review');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOneAndDelete({
            $or: [
                { referenceId: id },
                { slug: id.toLowerCase() },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!property) {
            errorResponse(res, 'Property not found', 404);
            return;
        }
        successResponse(res, null, 'Property deleted successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const property = await Property.findOneAndUpdate({
            $or: [
                { referenceId: id },
                { slug: id.toLowerCase() },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        }, { status }, { new: true });
        if (!property) {
            errorResponse(res, 'Property not found', 404);
            return;
        }
        successResponse(res, property, `Property status updated to ${status}`);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
