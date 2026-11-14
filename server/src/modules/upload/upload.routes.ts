import { Request, Response, Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { upload } from '../../middleware/upload.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { config } from '../../config/index.js';

const router = Router();

// Upload Public Media / Images (Listing photos, developer logos)
router.post(
  '/image',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager', 'sales-manager', 'seller', 'developer', 'agent'),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        errorResponse(res, 'No image file uploaded', 400);
        return;
      }

      const fileUrl = `/uploads/images/${req.file.filename}`;

      successResponse(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          isPrivate: false,
        },
        'Image uploaded successfully',
        201
      );
    } catch (err: any) {
      errorResponse(res, err.message, 500);
    }
  }
);

// Upload Private Legal Document (Patta, DTCP, RERA certificates, parent deeds)
router.post(
  '/document',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager'),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        errorResponse(res, 'No document file uploaded', 400);
        return;
      }

      // Secure protected URL routed through authentication middleware
      const fileUrl = `/api/v1/upload/documents/${req.file.filename}`;

      successResponse(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          isPrivate: true,
        },
        'Private legal document uploaded successfully',
        201
      );
    } catch (err: any) {
      errorResponse(res, err.message, 500);
    }
  }
);

// Secure Private Document Retrieval (Protected: only authorized staff)
router.get(
  '/documents/:filename',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager', 'sales-manager'),
  (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const safeFilename = path.basename(filename);
      const filePath = path.join(config.uploadDir, 'documents', safeFilename);

      if (!fs.existsSync(filePath)) {
        errorResponse(res, 'Document not found or access denied.', 404);
        return;
      }

      res.sendFile(filePath);
    } catch (err: any) {
      errorResponse(res, err.message, 500);
    }
  }
);

// Legacy fallback endpoint
router.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        errorResponse(res, 'No file uploaded', 400);
        return;
      }

      const isImage = req.file.mimetype.startsWith('image/');
      const fileUrl = isImage
        ? `/uploads/images/${req.file.filename}`
        : `/api/v1/upload/documents/${req.file.filename}`;

      successResponse(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          isPrivate: !isImage,
        },
        'File uploaded successfully',
        201
      );
    } catch (err: any) {
      errorResponse(res, err.message, 500);
    }
  }
);

export default router;
