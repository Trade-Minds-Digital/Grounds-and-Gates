import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'lead' | 'visit' | 'booking' | 'system' | 'property';

export interface INotification extends Document {
  referenceId: string;
  recipient?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  actionView?: string;
  actionParams?: Record<string, any>;
}

const NotificationSchema = new Schema<INotification>(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['lead', 'visit', 'booking', 'system', 'property'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    timestamp: { type: String, required: true },
    actionView: String,
    actionParams: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
