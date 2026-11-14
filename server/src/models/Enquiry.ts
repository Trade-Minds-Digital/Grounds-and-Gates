import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
  referenceId: string;
  property?: mongoose.Types.ObjectId;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyLocation: string;
  customer?: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  visitDate?: string;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  source: string;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    propertyId: { type: String, required: true, trim: true },
    propertyTitle: { type: String, required: true, trim: true },
    propertyPrice: { type: Number, default: 0 },
    propertyLocation: { type: String, default: '' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, default: '' },
    visitDate: String,
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    source: { type: String, default: 'website-enquiry' },
  },
  { timestamps: true }
);

EnquirySchema.index({ email: 1 });
EnquirySchema.index({ propertyId: 1 });
EnquirySchema.index({ status: 1 });

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
