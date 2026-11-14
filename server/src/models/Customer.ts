import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  user?: mongoose.Types.ObjectId;
  referenceId: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address?: string;
  preferredCategories: string[];
  budgetRange: { min: number; max: number };
  enquiryIds: string[];
  bookingIds: string[];
  notes?: string;
  isSample?: boolean;
  isActive: boolean;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    referenceId: { type: String, required: true, unique: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: 'Tamil Nadu' },
    address: String,
    preferredCategories: [{ type: String }],
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 50000000 },
    },
    enquiryIds: [{ type: String }],
    bookingIds: [{ type: String }],
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
