import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  property: mongoose.Types.ObjectId;
  propertyId: string;
  customer?: mongoose.Types.ObjectId;
  authorName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
}

const ReviewSchema = new Schema<IReview>(
  {
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
  },
  { timestamps: true }
);

ReviewSchema.index({ propertyId: 1, status: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
