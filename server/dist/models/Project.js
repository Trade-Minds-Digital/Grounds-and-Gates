import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
    referenceId: { type: String, required: true, unique: true, trim: true },
    developer: { type: Schema.Types.ObjectId, ref: 'Developer', required: true },
    developerId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    tamilName: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: 'residential' },
    district: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pre-launch', 'under-construction', 'ready-to-occupy', 'completed'],
        default: 'ready-to-occupy',
    },
    completionYear: { type: Number, required: true },
    reraNumber: { type: String, required: true, trim: true },
    approvalAuthority: {
        type: String,
        enum: ['DTCP', 'CMDA', 'RERA'],
        default: 'DTCP',
    },
    totalUnits: { type: Number, required: true, default: 50 },
    availableUnits: { type: Number, required: true, default: 10 },
    priceRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    amenities: [{ type: String }],
    gallery: [{ type: String }],
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
ProjectSchema.index({ district: 1, locality: 1 });
export const Project = mongoose.model('Project', ProjectSchema);
