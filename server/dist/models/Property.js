import mongoose, { Schema } from 'mongoose';
const PropertySchema = new Schema({
    referenceId: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
    title: { type: String, required: true, trim: true },
    tamilTitle: { type: String, trim: true },
    description: { type: String, required: true },
    tamilDescription: { type: String, trim: true },
    category: {
        type: String,
        required: true,
        enum: [
            'residential-plots',
            'agricultural-land',
            'independent-houses',
            'villas',
            'apartments',
            'commercial-properties',
        ],
    },
    propertyType: { type: String, default: 'Residential' },
    listingType: { type: String, required: true, enum: ['buy', 'rent'], default: 'buy' },
    ownershipType: { type: String, required: true, enum: ['company', 'third-party'], default: 'company' },
    price: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, default: 'Total' },
    negotiable: { type: Boolean, default: false },
    plotArea: { type: Number, required: true, min: 0 },
    plotAreaUnit: { type: String, required: true, enum: ['cents', 'sq.ft', 'acres'], default: 'cents' },
    builtUpArea: { type: Number },
    builtUpAreaUnit: { type: String, default: 'sq.ft' },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    balconies: { type: Number, default: 0 },
    facing: {
        type: String,
        required: true,
        enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
        default: 'North',
    },
    furnishingStatus: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        default: 'unfurnished',
    },
    floors: { type: Number },
    roadWidthFeet: { type: Number },
    address: { type: String, required: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    state: { type: String, default: 'Tamil Nadu' },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    locationGeo: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false,
        },
    },
    locationConfirmed: { type: Boolean, default: false },
    locationConfirmedAt: { type: Date },
    locationSource: {
        type: String,
        enum: ['picker', 'manual', 'geocoded'],
        default: 'manual',
    },
    isApproximateLocation: { type: Boolean, default: false },
    placeId: { type: String },
    landmark: String,
    images: [{ type: String, required: true }],
    videos: [{ type: String }],
    videoUrl: String,
    videoType: { type: String, enum: ['direct', 'youtube', 'vimeo'] },
    floorPlans: [{ type: String }],
    amenities: [{ type: String }],
    nearbyFacilities: [
        {
            name: String,
            distance: String,
            type: { type: String },
        },
    ],
    seller: {
        name: { type: String, required: true },
        type: { type: String, enum: ['company', 'owner', 'agent', 'builder'], default: 'company' },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        experienceYears: Number,
        totalListings: Number,
        isCompanyRepresentative: Boolean,
        avatarUrl: String,
    },
    developer: { type: Schema.Types.ObjectId, ref: 'Developer' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectId: { type: String, trim: true },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalAuthority: {
        type: String,
        enum: ['DTCP', 'CMDA', 'RERA', 'Panchayat', 'Agricultural Patta'],
    },
    approvalNumber: String,
    dtcpApproved: { type: Boolean, default: false },
    cmdaApproved: { type: Boolean, default: false },
    reraId: String,
    waterSource: [{ type: String }],
    electricitySupply: String,
    carpetArea: Number,
    superBuiltUpArea: Number,
    plotLength: Number,
    plotWidth: Number,
    roadType: { type: String, enum: ['tar', 'concrete', 'gravel', 'mud'] },
    isCornerPlot: { type: Boolean, default: false },
    isGatedLayout: { type: Boolean, default: false },
    boundaryWall: { type: Boolean, default: false },
    landUseClassification: { type: String, enum: ['dry-land', 'wet-land', 'garden-land'] },
    irrigationSource: [{ type: String }],
    cropType: String,
    structuresOnLand: [{ type: String }],
    soilType: String,
    commercialSubtype: { type: String, enum: ['office', 'retail', 'warehouse', 'industrial', 'land'] },
    powerLoadKw: Number,
    frontageFeet: Number,
    ceilingHeightFeet: Number,
    suitableUse: [{ type: String }],
    constructionStatus: { type: String, enum: ['ready-to-move', 'under-construction', 'new-launch'] },
    possessionDate: Date,
    propertyAgeYears: Number,
    floorNumber: Number,
    totalFloors: Number,
    parkingSpaces: Number,
    parkingType: { type: String, enum: ['covered', 'open', 'none'] },
    hasLift: { type: Boolean, default: false },
    priceBasis: { type: String, enum: ['total', 'per_cent', 'per_sqft', 'per_acre', 'per_month'] },
    deposit: Number,
    maintenanceFee: Number,
    maintenanceFrequency: { type: String, enum: ['monthly', 'quarterly', 'annual'] },
    contactPreferences: {
        preferredTime: String,
        allowWhatsApp: { type: Boolean, default: true },
        phoneAvailable: { type: Boolean, default: true },
        siteVisitDays: [{ type: String }],
    },
    draftStep: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['active', 'under-negotiation', 'sold', 'pending-review'],
        default: 'active',
    },
    publishingStatus: {
        type: String,
        enum: ['draft', 'pending-review', 'published', 'rejected', 'archived'],
        default: 'published',
    },
    availability: {
        type: String,
        enum: ['available', 'under-negotiation', 'sold'],
        default: 'available',
    },
    verified: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    legalDocuments: [
        {
            title: { type: String, required: true },
            url: { type: String, required: true },
            documentType: { type: String, default: 'General' },
            isPrivate: { type: Boolean, default: true },
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    verificationReview: {
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewerEmail: { type: String },
        reviewedAt: { type: Date },
        status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
        notes: { type: String },
        supportingDocuments: [{ type: String }],
    },
    viewsCount: { type: Number, default: 0 },
    enquiriesCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            ret.id = ret.referenceId || ret._id?.toString() || ret.id;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: function (_doc, ret) {
            ret.id = ret.referenceId || ret._id?.toString() || ret.id;
            return ret;
        },
    },
});
// Pre-save middleware to synchronize coordinates { lat, lng } with GeoJSON locationGeo [lng, lat]
PropertySchema.pre('save', function (next) {
    if (this.coordinates && typeof this.coordinates.lat === 'number' && typeof this.coordinates.lng === 'number') {
        this.locationGeo = {
            type: 'Point',
            coordinates: [this.coordinates.lng, this.coordinates.lat],
        };
    }
    else if (this.locationGeo && Array.isArray(this.locationGeo.coordinates) && this.locationGeo.coordinates.length === 2) {
        if (!this.coordinates) {
            this.coordinates = {
                lng: this.locationGeo.coordinates[0],
                lat: this.locationGeo.coordinates[1],
            };
        }
    }
    else {
        this.locationGeo = undefined;
    }
    next();
});
PropertySchema.index({ district: 1, locality: 1 });
PropertySchema.index({ category: 1, listingType: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ status: 1, availability: 1, published: 1 });
PropertySchema.index({ featured: 1 });
PropertySchema.index({ locationConfirmed: 1 });
PropertySchema.index({ locationGeo: '2dsphere' }, { sparse: true });
PropertySchema.index({ title: 'text', description: 'text', locality: 'text' });
export const Property = mongoose.model('Property', PropertySchema);
