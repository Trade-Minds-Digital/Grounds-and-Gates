import mongoose, { Schema, Document } from 'mongoose';

export interface IComparison extends Document {
  user?: mongoose.Types.ObjectId;
  userId?: string;
  properties: mongoose.Types.ObjectId[];
  propertyIds: string[];
}

const ComparisonSchema = new Schema<IComparison>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: { type: String, trim: true },
    properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    propertyIds: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

ComparisonSchema.index({ userId: 1 });

export const Comparison = mongoose.model<IComparison>('Comparison', ComparisonSchema);
