import mongoose, { Schema } from 'mongoose';
const SystemSettingSchema = new Schema({
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
    group: {
        type: String,
        enum: ['general', 'seo', 'notifications', 'payment', 'crm'],
        default: 'general',
    },
    isPublic: { type: Boolean, default: false },
}, { timestamps: true });
export const SystemSetting = mongoose.model('SystemSetting', SystemSettingSchema);
