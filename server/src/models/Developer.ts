import mongoose, { Schema, Document } from 'mongoose';

export interface IDeveloper extends Document {
  referenceId: string;
  name: string;
  tamilName?: string;
  slug: string;
  logo: string;
  verified: boolean;
  rating: number;
  completedProjectsCount: number;
  experienceYears: number;
  contactPhone: string;
  email: string;
  headquarters: string;
  description: string;
  isActive: boolean;
}

const DeveloperSchema = new Schema<IDeveloper>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    tamilName: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: '' },
    verified: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    completedProjectsCount: { type: Number, default: 10 },
    experienceYears: { type: Number, default: 12 },
    contactPhone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    headquarters: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DeveloperSchema.index({ name: 1 });

export const Developer = mongoose.model<IDeveloper>('Developer', DeveloperSchema);
