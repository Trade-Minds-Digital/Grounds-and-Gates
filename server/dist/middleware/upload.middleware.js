import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { config } from '../config/index.js';
// Ensure upload directories exist
const uploadDir = config.uploadDir;
const imagesDir = path.join(uploadDir, 'images');
const documentsDir = path.join(uploadDir, 'documents');
const videosDir = path.join(uploadDir, 'videos');
[uploadDir, imagesDir, documentsDir, videosDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, imagesDir);
        }
        else {
            cb(null, documentsDir);
        }
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Unsupported file format. Please upload JPEG, PNG, WEBP, SVG, or PDF.'));
    }
};
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter,
});
const videoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, videosDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `video-${uniqueSuffix}${ext}`);
    },
});
const videoFileFilter = (_req, file, cb) => {
    const allowedVideoMimes = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
    ];
    if (allowedVideoMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Unsupported video format. Allowed formats: MP4, WebM, MOV.'));
    }
};
export const videoUpload = multer({
    storage: videoStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: videoFileFilter,
});
