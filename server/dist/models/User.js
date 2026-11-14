import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
        type: String,
        required: true,
        default: 'buyer',
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
    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: 'active',
    },
    profileImage: { type: String, default: '' },
    address: {
        street: String,
        city: String,
        district: String,
        state: { type: String, default: 'Tamil Nadu' },
        pincode: String,
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    tokenVersion: { type: Number, default: 0 },
    lastLogin: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.passwordHash;
            delete ret.refreshToken;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: function (_doc, ret) {
            delete ret.passwordHash;
            delete ret.refreshToken;
            delete ret.__v;
            return ret;
        },
    },
});
UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};
export const User = mongoose.model('User', UserSchema);
