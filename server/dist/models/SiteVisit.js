import mongoose, { Schema } from 'mongoose';
const SiteVisitSchema = new Schema({
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
}, { timestamps: true });
SiteVisitSchema.index({ date: 1, timeSlot: 1 });
SiteVisitSchema.index({ propertyId: 1 });
SiteVisitSchema.index({ assignedEmployeeId: 1 });
SiteVisitSchema.index({ status: 1 });
export const SiteVisit = mongoose.model('SiteVisit', SiteVisitSchema);
