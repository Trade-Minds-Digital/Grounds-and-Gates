import mongoose, { Schema } from 'mongoose';
const EnquirySchema = new Schema({
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
}, { timestamps: true });
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ propertyId: 1 });
EnquirySchema.index({ status: 1 });
export const Enquiry = mongoose.model('Enquiry', EnquirySchema);
