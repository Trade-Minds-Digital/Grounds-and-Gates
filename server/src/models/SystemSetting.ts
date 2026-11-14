import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description: string;
  group: 'general' | 'seo' | 'notifications' | 'payment' | 'crm';
  isPublic: boolean;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
    group: {
      type: String,
      enum: ['general', 'seo', 'notifications', 'payment', 'crm'],
      default: 'general',
    },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
