import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  user?: mongoose.Types.ObjectId;
  userId?: string;
  property: mongoose.Types.ObjectId;
  propertyId: string;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: { type: String, trim: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyId: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, propertyId: 1 });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
