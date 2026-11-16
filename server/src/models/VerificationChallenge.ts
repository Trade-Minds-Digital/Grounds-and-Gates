import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'node:crypto';
import { config } from '../config/index.js';

export interface IVerificationChallenge extends Document {
  challengeId: string;
  userId: mongoose.Types.ObjectId;
  email: string;
  purpose: 'email_verification' | 'password_reset' | 'email_change';
  otpHash: string;
  expiresAt: Date;
  resendCooldownUntil: Date;
  attempts: number;
  maxAttempts: number;
  consumed: boolean;
  consumedAt?: Date;
  status: 'active' | 'consumed' | 'expired' | 'exhausted' | 'superseded';
  createdAt: Date;
  updatedAt: Date;
}

const VerificationChallengeSchema = new Schema<IVerificationChallenge>(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset', 'email_change'],
      default: 'email_verification',
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    resendCooldownUntil: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    consumed: {
      type: Boolean,
      default: false,
      index: true,
    },
    consumedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'consumed', 'expired', 'exhausted', 'superseded'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding active challenges
VerificationChallengeSchema.index({ challengeId: 1, status: 1 });
VerificationChallengeSchema.index({ email: 1, purpose: 1, status: 1 });

/**
 * Generate a cryptographically secure 6-digit numeric OTP string
 */
export function generateNumericOtp(): string {
  // Generates integer between 100000 and 999999 inclusive
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hash an OTP using HMAC-SHA256 with the server OTP salt/secret and email
 */
export function hashOtp(otp: string, email: string): string {
  const secret = config.otpHashSecret || 'gg_otp_challenge_hmac_secret_2026';
  const normalizedEmail = email.toLowerCase().trim();
  return crypto
    .createHmac('sha256', secret)
    .update(`${otp}:${normalizedEmail}`)
    .digest('hex');
}

/**
 * Timing-safe comparison of provided OTP with stored HMAC digest
 */
export function verifyOtpHash(candidateOtp: string, email: string, storedHash: string): boolean {
  if (!candidateOtp || candidateOtp.length !== 6 || !storedHash) {
    return false;
  }
  const candidateHash = hashOtp(candidateOtp, email);
  try {
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Mask an email for user-facing display (e.g. "k****@example.com" or "j***e@domain.com")
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '****';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  const maskedLocal = `${first}${'*'.repeat(Math.max(3, local.length - 2))}${last}`;
  return `${maskedLocal}@${domain}`;
}

export const VerificationChallenge = mongoose.model<IVerificationChallenge>(
  'VerificationChallenge',
  VerificationChallengeSchema
);

