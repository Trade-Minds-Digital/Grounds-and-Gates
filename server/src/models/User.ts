import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firebaseUid?: string;
  fullName: string;
  email: string;
  mobile: string;
  passwordHash?: string;
  role: string; // role slug, e.g. 'super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager', 'agent', 'buyer', 'seller'
  roleId?: mongoose.Types.ObjectId;
  accountStatus: 'active' | 'inactive' | 'suspended' | 'pending';
  accountUsage?: 'buyer' | 'seller' | 'both';
  sellerDetails?: {
    sellerType?: 'owner' | 'agent' | 'builder' | 'developer';
    companyName?: string;
    reraNumber?: string;
    licenseNumber?: string;
    taxId?: string;
    operatingAreas?: string[];
    preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
  };
  consents?: {
    termsAccepted?: boolean;
    termsAcceptedAt?: Date;
    termsPolicyVersion?: string;
    privacyAccepted?: boolean;
    marketingConsent?: boolean;
    marketingConsentAt?: Date;
  };
  profileImage?: string;
  address?: {
    street?: string;
    locality?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  phoneVerified: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  tokenVersion: number;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret: any) {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
