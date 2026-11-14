import mongoose, { Schema } from 'mongoose';
const LeadSchema = new Schema({
    referenceId: { type: String, required: true, unique: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerId: { type: String, trim: true },
    buyerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    propertyId: { type: String, trim: true, default: 'prop-general' },
    propertyTitle: { type: String, trim: true, default: 'General Property Inquiry' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    stage: {
        type: String,
        required: true,
        enum: ['new', 'contacted', 'qualified', 'scheduled', 'negotiation', 'won', 'lost'],
        default: 'new',
    },
    priority: {
        type: String,
        required: true,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    assignedEmployee: { type: Schema.Types.ObjectId, ref: 'Employee' },
    assignedEmployeeId: { type: String, trim: true },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
    source: {
        type: String,
        enum: ['website', 'property-enquiry', 'contact-form', 'phone', 'whatsapp', 'walk-in', 'referral'],
        default: 'website',
    },
    offerAmount: { type: Number },
    message: { type: String, default: '' },
    scheduledVisitDate: { type: Date },
    nextFollowUpDate: { type: Date },
    notes: { type: String, default: '' },
    dateStr: { type: String, default: 'Today' },
}, { timestamps: true });
LeadSchema.index({ stage: 1, priority: 1 });
LeadSchema.index({ propertyId: 1 });
LeadSchema.index({ assignedEmployee: 1 });
LeadSchema.index({ email: 1, phone: 1 });
export const Lead = mongoose.model('Lead', LeadSchema);
