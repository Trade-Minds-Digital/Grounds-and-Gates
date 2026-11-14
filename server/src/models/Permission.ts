import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'publish' | 'assign' | 'export' | 'archive';
  description: string;
}

const PermissionSchema = new Schema<IPermission>(
  {
    module: { type: String, required: true, trim: true },
    action: {
      type: String,
      required: true,
      enum: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'publish', 'assign', 'export', 'archive'],
    },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

PermissionSchema.index({ module: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
