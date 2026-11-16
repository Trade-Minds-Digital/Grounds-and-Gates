import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    firebaseUid: { type: String, sparse: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: false, select: false },
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
    accountUsage: {
        type: String,
        enum: ['buyer', 'seller', 'both'],
        default: 'buyer',
    },
    sellerDetails: {
        sellerType: {
            type: String,
            enum: ['owner', 'agent', 'builder', 'developer'],
        },
        companyName: { type: String, trim: true },
        reraNumber: { type: String, trim: true },
        licenseNumber: { type: String, trim: true },
        taxId: { type: String, trim: true },
        operatingAreas: [{ type: String, trim: true }],
        preferredContactMethod: {
            type: String,
            enum: ['email', 'phone', 'whatsapp'],
            default: 'phone',
        },
    },
    consents: {
        termsAccepted: { type: Boolean, default: false },
        termsAcceptedAt: { type: Date },
        termsPolicyVersion: { type: String, default: '2026.1' },
        privacyAccepted: { type: Boolean, default: false },
        marketingConsent: { type: Boolean, default: false },
        marketingConsentAt: { type: Date },
    },
    profileImage: { type: String, default: '' },
    address: {
        street: String,
        locality: String,
        city: String,
        district: String,
        state: { type: String, default: 'Tamil Nadu' },
        pincode: String,
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
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
UserSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash)
        return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};
export const User = mongoose.model('User', UserSchema);
