import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
    referenceId: { type: String, required: true, unique: true, trim: true },
    isSample: { type: Boolean, default: false, index: true },
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
}, { timestamps: true });
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });
export const Notification = mongoose.model('Notification', NotificationSchema);
