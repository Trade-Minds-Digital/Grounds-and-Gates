import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config();
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
    uploadDir: path.resolve(process.cwd(), 'uploads'),
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
};
