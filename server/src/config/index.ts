import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// Load environment variables from current directory, server directory, or parent workspace
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grounds_and_gates',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'gg_jwt_access_secret_super_secure_key_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'gg_jwt_refresh_secret_super_secure_key_2026',
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'gg_cookie_secret_salt_2026',
  uploadDir: (() => {
    if (process.env.UPLOAD_DIR) return path.resolve(process.env.UPLOAD_DIR);
    const serverUploads = path.resolve(process.cwd(), 'server', 'uploads');
    if (fs.existsSync(serverUploads)) return serverUploads;
    const localUploads = path.resolve(process.cwd(), 'uploads');
    if (fs.existsSync(localUploads)) return localUploads;
    return path.resolve(process.cwd(), 'uploads');
  })(),
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@groundsandgates.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@Grounds2026',
    fullName: process.env.ADMIN_NAME || 'Super Administrator',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  geoapifyApiKey: process.env.GEOAPIFY_API_KEY || process.env.VITE_GEOAPIFY_API_KEY || '',
  appUrl: process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:3000',
  otpHashSecret: process.env.OTP_HASH_SECRET || 'gg_otp_challenge_hmac_secret_2026',
  allowMailCapture: process.env.NODE_ENV === 'test' || process.env.ALLOW_MAIL_CAPTURE === 'true',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'support@groundsandgates.com',
    fromName: process.env.SMTP_FROM_NAME || 'Grounds & Gates',
    secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    emulatorHost: process.env.FIREBASE_AUTH_EMULATOR_HOST || '',
  },
};
