import mongoose, { Schema, Document } from 'mongoose';

export type MasterGroup = 'location' | 'property' | 'crm' | 'organization' | 'content';

export interface IMasterItem extends Document {
  type: string; // e.g. 'country', 'state', 'district', 'city', 'locality', 'regional_hub', 'property_category', etc.
  group: MasterGroup;
  code: string; // stable unique slug/code, e.g. 'coimbatore', 'residential-plots', 'amenity-pool'
  name: string; // English display name
  nameTa?: string; // Tamil display name
  description?: string;
  parentCode?: string; // stable parent code for hierarchical dependent lookups
  parentId?: mongoose.Types.ObjectId;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean; // protected from deletion or code alteration
  metadata?: Record<string, any>; // e.g. conversionFactor, icon, corridor, timeWindow, pinCode
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MasterItemSchema = new Schema<IMasterItem>(
  {
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
  },
  { timestamps: true }
);

// Compound indexes
MasterItemSchema.index({ type: 1, code: 1 }, { unique: true });
MasterItemSchema.index({ type: 1, isActive: 1, displayOrder: 1 });
MasterItemSchema.index({ group: 1, type: 1, isActive: 1 });
MasterItemSchema.index({ type: 1, parentCode: 1, isActive: 1 });

export const MasterItem = mongoose.model<IMasterItem>('MasterItem', MasterItemSchema);

