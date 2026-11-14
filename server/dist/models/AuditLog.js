import mongoose, { Schema } from 'mongoose';
const AuditLogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: String,
    action: { type: String, required: true },
    module: { type: String, required: true },
    entityId: String,
    changes: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });
AuditLogSchema.index({ module: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
