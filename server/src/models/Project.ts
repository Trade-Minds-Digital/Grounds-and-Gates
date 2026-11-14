import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  referenceId: string;
  developer: mongoose.Types.ObjectId;
  developerId?: string;
  name: string;
  tamilName?: string;
  slug: string;
  category: string;
  district: string;
  locality: string;
  address: string;
  status: 'pre-launch' | 'under-construction' | 'ready-to-occupy' | 'completed';
  completionYear: number;
  reraNumber: string;
  approvalAuthority: 'DTCP' | 'CMDA' | 'RERA';
  totalUnits: number;
  availableUnits: number;
  priceRange: { min: number; max: number };
  amenities: string[];
  gallery: string[];
  description: string;
  isSample?: boolean;
  isActive: boolean;
}

const ProjectSchema = new Schema<IProject>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
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
  },
  { timestamps: true }
);

ProjectSchema.index({ district: 1, locality: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
