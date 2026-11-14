import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyId: { type: String, required: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved',
    },
}, { timestamps: true });
ReviewSchema.index({ propertyId: 1, status: 1 });
export const Review = mongoose.model('Review', ReviewSchema);
