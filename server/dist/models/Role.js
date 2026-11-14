import mongoose, { Schema } from 'mongoose';
const RoleSchema = new Schema({
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
}, { timestamps: true });
export const Role = mongoose.model('Role', RoleSchema);
