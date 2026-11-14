import { Property } from '../../models/Property.js';
import { AuditLog } from '../../models/AuditLog.js';
import { slugify } from '../../utils/slug.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getProperties = async (req, res) => {
    try {
        const { searchQuery, category, district, locality, listingType, ownershipType, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, facing, featuredOnly, page = '1', limit = '12', sortBy = 'newest', } = req.query;
        const filter = {
            published: true,
            publishingStatus: 'published',
        };
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
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .populate('project', 'name reraNumber status')
                .populate('developer', 'name verified logo rating'),
            Property.countDocuments(filter),
        ]);
        const pages = Math.ceil(total / limitNum) || 1;
        successResponse(res, properties, 'Properties fetched successfully', 200, { total, page: pageNum, limit: limitNum, pages });
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
        const authReq = req;
        const isStaff = Boolean(authReq.user && ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(authReq.user.role));
        // Access rule: If listing is unpublished/draft/rejected/archived, deny public access
        if ((property.published === false || ['draft', 'pending-review', 'rejected', 'archived'].includes(property.publishingStatus)) && !isStaff) {
            errorResponse(res, 'Property listing is not currently published.', 404);
            return;
        }
        // Increment views asynchronously
        property.viewsCount += 1;
        await property.save();
        const propObj = property.toObject();
        // Access rule: Strip private legal documents from non-staff responses
        if (!isStaff && propObj.legalDocuments) {
            propObj.legalDocuments = propObj.legalDocuments.filter((d) => !d.isPrivate);
        }
        successResponse(res, propObj);
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
export const createProperty = async (req, res) => {
    try {
        const data = req.body;
        const referenceId = data.referenceId || `gg-${Date.now().toString(36).toLowerCase()}`;
        const slug = data.slug || `${slugify(data.title)}-${referenceId.slice(-6)}`;
        const description = data.description || `${data.title} located in ${data.locality || data.district}, Tamil Nadu. Verified clear title listing.`;
        const city = data.city || data.locality || data.district || 'Coimbatore';
        const seller = data.seller || {
            name: data.sellerName || 'Grounds & Gates Advisory Desk',
            type: 'company',
            phone: data.sellerPhone || '+91 98422 71000',
            email: data.sellerEmail || 'sales@groundsandgates.com',
            isCompanyRepresentative: true,
        };
        const images = data.images && data.images.length > 0 ? data.images : [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
        ];
        const newProperty = await Property.create({
            ...data,
            referenceId,
            slug,
            description,
            city,
            locality: data.locality || city,
            seller,
            images,
            createdBy: req.user?.userId,
            viewsCount: 0,
            enquiriesCount: 0,
            published: true,
            verified: true,
        });
        successResponse(res, newProperty, 'Property created successfully', 201);
    }
    catch (err) {
        console.error('Property creation error:', err);
        errorResponse(res, err.message, 500);
    }
};
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOneAndUpdate({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        }, { ...req.body, updatedBy: req.user?.userId }, { new: true });
        if (!property) {
            errorResponse(res, 'Property not found', 404);
            return;
        }
        successResponse(res, property, 'Property updated successfully');
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
