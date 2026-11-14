import mongoose, { Schema, Document } from 'mongoose';

export type WebContentSection =
  | 'homepage_hero'
  | 'homepage_sections'
  | 'about_page'
  | 'contact_page'
  | 'seo_metadata'
  | 'faqs'
  | 'testimonials'
  | 'team_profiles'
  | 'company_profile';

export interface IWebContent extends Document {
  section: string;
  title: string;
  titleTa?: string;
  subtitle?: string;
  subtitleTa?: string;
  content: Record<string, any>; // Published live content
  draftContent?: Record<string, any> | null; // Working draft content
  status: 'draft' | 'published';
  version: number;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WebContentSchema = new Schema<IWebContent>(
  {
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
  },
  { timestamps: true }
);

export const WebContent = mongoose.model<IWebContent>('WebContent', WebContentSchema);
