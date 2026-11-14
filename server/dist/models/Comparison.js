import mongoose, { Schema } from 'mongoose';
const ComparisonSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: { type: String, trim: true },
    properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    propertyIds: [{ type: String, trim: true }],
}, { timestamps: true });
ComparisonSchema.index({ userId: 1 });
export const Comparison = mongoose.model('Comparison', ComparisonSchema);
