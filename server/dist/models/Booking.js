import mongoose, { Schema } from 'mongoose';
const BookingSchema = new Schema({
    bookingNumber: { type: String, required: true, unique: true, trim: true },
    referenceId: { type: String, required: true, unique: true, trim: true },
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
}, { timestamps: true });
BookingSchema.index({ propertyId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingDate: 1 });
export const Booking = mongoose.model('Booking', BookingSchema);
