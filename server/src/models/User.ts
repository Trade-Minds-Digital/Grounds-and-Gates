import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: string; // role slug, e.g. 'super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager', 'agent', 'buyer'
  roleId?: mongoose.Types.ObjectId;
  accountStatus: 'active' | 'inactive' | 'suspended' | 'pending';
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  emailVerified: boolean;
  phoneVerified: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  tokenVersion: number;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
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

UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
