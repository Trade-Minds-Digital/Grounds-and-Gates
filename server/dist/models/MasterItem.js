import mongoose, { Schema } from 'mongoose';
const MasterItemSchema = new Schema({
    type: { type: String, required: true, trim: true, lowercase: true, index: true },
    group: {
        type: String,
        required: true,
        enum: ['location', 'property', 'crm', 'organization', 'content'],
        index: true,
    },
    code: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    nameTa: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    parentCode: { type: String, trim: true, lowercase: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isSystem: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
// Compound indexes
MasterItemSchema.index({ type: 1, code: 1 }, { unique: true });
MasterItemSchema.index({ type: 1, isActive: 1, displayOrder: 1 });
MasterItemSchema.index({ group: 1, type: 1, isActive: 1 });
MasterItemSchema.index({ type: 1, parentCode: 1, isActive: 1 });
export const MasterItem = mongoose.model('MasterItem', MasterItemSchema);
