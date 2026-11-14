import mongoose, { Schema, Document } from 'mongoose';

export type RoleSlug =
  | 'super-admin'
  | 'admin'
  | 'employee'
  | 'sales-manager'
  | 'sales-executive'
  | 'listing-manager'
  | 'agent'
  | 'developer'
  | 'seller'
  | 'buyer';

export interface IRole extends Document {
  name: string;
  slug: RoleSlug;
  description: string;
  permissions: mongoose.Types.ObjectId[];
  isSystem: boolean;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: [
        'super-admin',
        'admin',
        'employee',
        'sales-manager',
        'sales-executive',
        'listing-manager',
        'agent',
        'developer',
        'seller',
        'buyer',
      ],
    },
    description: { type: String, required: true, trim: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
