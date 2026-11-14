import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus = 'draft' | 'token-received' | 'documentation' | 'registered' | 'cancelled';
export type PaymentStatus = 'pending' | 'partially-paid' | 'paid' | 'refunded';

export interface IBooking extends Document {
  bookingNumber: string;
  referenceId: string;
  property?: mongoose.Types.ObjectId;
  propertyId: string;
  propertyTitle: string;
  customer?: mongoose.Types.ObjectId;
  customerId?: string;
  customerName: string;
  lead?: mongoose.Types.ObjectId;
  leadId?: string;
  assignedEmployee?: mongoose.Types.ObjectId;
  assignedEmployeeId?: string;
  tokenAmount: number;
  totalAmount: number;
  agreedPrice?: number;
  bookingDate: string;
  registrationTargetDate?: string;
  status: BookingStatus;
  paymentMethod: 'Net Banking / RTGS' | 'UPI' | 'Demand Draft' | 'Cheque';
  paymentStatus: PaymentStatus;
  transactionRef?: string;
  documents?: string[];
  notes?: string;
  bookingStatus?: BookingStatus;
  isSample?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, trim: true },
    referenceId: { type: String, required: true, unique: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    propertyId: { type: String, required: true, trim: true },
    propertyTitle: { type: String, required: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerId: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    leadId: { type: String, trim: true },
    assignedEmployee: { type: Schema.Types.ObjectId, ref: 'Employee' },
    assignedEmployeeId: { type: String, trim: true },
    tokenAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    agreedPrice: { type: Number },
    bookingDate: { type: String, required: true },
    registrationTargetDate: String,
    status: {
      type: String,
      required: true,
      enum: ['draft', 'token-received', 'documentation', 'registered', 'cancelled'],
      default: 'token-received',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Net Banking / RTGS', 'UPI', 'Demand Draft', 'Cheque'],
      default: 'Net Banking / RTGS',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially-paid', 'paid', 'refunded'],
      default: 'partially-paid',
    },
    transactionRef: String,
    documents: [{ type: String }],
    notes: String,
  },
  { timestamps: true }
);

BookingSchema.index({ propertyId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingDate: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
