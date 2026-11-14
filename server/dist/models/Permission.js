import mongoose, { Schema } from 'mongoose';
const PermissionSchema = new Schema({
    module: { type: String, required: true, trim: true },
    action: {
        type: String,
        required: true,
        enum: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'publish', 'assign', 'export', 'archive'],
    },
    description: { type: String, required: true, trim: true },
}, { timestamps: true });
PermissionSchema.index({ module: 1, action: 1 }, { unique: true });
export const Permission = mongoose.model('Permission', PermissionSchema);
