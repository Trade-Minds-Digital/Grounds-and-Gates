import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: string;
  module: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: String,
    action: { type: String, required: true },
    module: { type: String, required: true },
    entityId: String,
    changes: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

AuditLogSchema.index({ module: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
