import mongoose, { Schema, Document } from 'mongoose';

export type VisitStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type VisitTimeSlot = 'morning' | 'afternoon' | 'evening';

export interface ISiteVisit extends Document {
  referenceId: string;
  lead?: mongoose.Types.ObjectId;
  leadId?: string;
  property?: mongoose.Types.ObjectId;
  propertyId: string;
  propertyTitle: string;
  customer?: mongoose.Types.ObjectId;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  assignedEmployee?: mongoose.Types.ObjectId;
  assignedEmployeeId?: string;
  date: string; // YYYY-MM-DD
  timeSlot: VisitTimeSlot;
  status: VisitStatus;
  feedback?: string;
  notes?: string;
  isSample?: boolean;
  transportProvided: boolean;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    leadId: { type: String, trim: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    propertyId: { type: String, required: true, trim: true },
    propertyTitle: { type: String, required: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerId: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    assignedEmployee: { type: Schema.Types.ObjectId, ref: 'Employee' },
    assignedEmployeeId: { type: String, trim: true },
    date: { type: String, required: true },
    timeSlot: {
      type: String,
      required: true,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning',
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    feedback: String,
    notes: String,
    transportProvided: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SiteVisitSchema.index({ date: 1, timeSlot: 1 });
SiteVisitSchema.index({ propertyId: 1 });
SiteVisitSchema.index({ assignedEmployeeId: 1 });
SiteVisitSchema.index({ status: 1 });

export const SiteVisit = mongoose.model<ISiteVisit>('SiteVisit', SiteVisitSchema);
