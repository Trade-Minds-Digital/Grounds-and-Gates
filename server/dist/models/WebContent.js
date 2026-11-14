import mongoose, { Schema } from 'mongoose';
const WebContentSchema = new Schema({
    section: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    titleTa: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
    subtitleTa: { type: String, trim: true, default: '' },
    content: { type: Schema.Types.Mixed, required: true, default: {} },
    draftContent: { type: Schema.Types.Mixed, default: null },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    version: { type: Number, default: 1 },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export const WebContent = mongoose.model('WebContent', WebContentSchema);
