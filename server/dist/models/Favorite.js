import mongoose, { Schema } from 'mongoose';
const FavoriteSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: { type: String, trim: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyId: { type: String, required: true, trim: true },
}, { timestamps: true });
FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, propertyId: 1 });
export const Favorite = mongoose.model('Favorite', FavoriteSchema);
