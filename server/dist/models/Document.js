import mongoose, { Schema } from 'mongoose';
const DocumentSchema = new Schema({
    referenceId: { type: String, required: true, unique: true, trim: true },
    entityType: {
        type: String,
        required: true,
        enum: ['property', 'project', 'booking', 'developer', 'customer'],
    },
    entityId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    documentType: {
        type: String,
        required: true,
        enum: ['patta', 'fmb', 'sale-deed', 'ec', 'approval-copy', 'rera-cert', 'kyc'],
        default: 'approval-copy',
    },
    fileUrl: { type: String, required: true },
    fileKey: String,
    fileSize: Number,
    mimeType: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationStatus: {
        type: String,
        enum: ['verified', 'pending', 'rejected'],
        default: 'verified',
    },
}, { timestamps: true });
DocumentSchema.index({ entityType: 1, entityId: 1 });
export const DocumentModel = mongoose.model('Document', DocumentSchema);
