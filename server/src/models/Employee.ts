import mongoose, { Schema, Document } from 'mongoose';

export type EmployeeRole = 'sales-executive' | 'crm-manager' | 'property-specialist' | 'legal-advisor';

export interface IEmployee extends Document {
  user?: mongoose.Types.ObjectId;
  referenceId: string;
  name: string;
  role: EmployeeRole;
  department: string;
  designation: string;
  phone: string;
  email: string;
  avatarUrl: string;
  activeDealsCount: number;
  performanceRating: number;
  specializationLocalities: string[];
  district: string;
  isActive: boolean;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    referenceId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['sales-executive', 'crm-manager', 'property-specialist', 'legal-advisor'],
      default: 'sales-executive',
    },
    department: { type: String, default: 'Sales & CRM' },
    designation: { type: String, default: 'Relationship Manager' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    avatarUrl: { type: String, default: '' },
    activeDealsCount: { type: Number, default: 0 },
    performanceRating: { type: Number, default: 4.8 },
    specializationLocalities: [{ type: String }],
    district: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ role: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
