import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType = 'call' | 'site-visit' | 'email' | 'status-change' | 'note' | 'token';

export interface IActivity extends Document {
  referenceId: string;
  entityType: 'lead' | 'booking' | 'property' | 'site-visit' | 'customer';
  entityId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  performedByEmployeeId?: string;
  metadata?: Record<string, any>;
}

const ActivitySchema = new Schema<IActivity>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    entityType: {
      type: String,
      required: true,
      enum: ['lead', 'booking', 'property', 'site-visit', 'customer'],
    },
    entityId: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['call', 'site-visit', 'email', 'status-change', 'note', 'token'],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    timestamp: { type: String, required: true },
    performedBy: { type: String, required: true, trim: true },
    performedByEmployeeId: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ActivitySchema.index({ entityType: 1, entityId: 1 });
ActivitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
