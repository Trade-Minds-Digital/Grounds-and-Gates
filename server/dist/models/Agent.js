import mongoose, { Schema } from 'mongoose';
const AgentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    agencyName: { type: String, trim: true },
    experienceYears: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 },
    activeListingsCount: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 2.0 },
    specializationAreas: [{ type: String }],
    verificationStatus: {
        type: String,
        enum: ['verified', 'pending', 'rejected'],
        default: 'verified',
    },
    bio: String,
}, { timestamps: true });
export const Agent = mongoose.model('Agent', AgentSchema);
