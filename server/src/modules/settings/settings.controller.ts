import { Response } from 'express';
import { SystemSetting } from '../../models/SystemSetting.js';
import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await SystemSetting.find();
    
    // Group settings
    const settingsMap: Record<string, any> = {
      companyName: 'Grounds & Gates Properties Pvt Ltd',
      tagline: 'Property Decisions Simplified',
      primaryPhone: '+91 98422 71000',
      secondaryPhone: '+91 98401 55620',
      supportEmail: 'contact@groundsandgates.com',
      coimbatoreOffice: 'Race Course Road, Coimbatore, Tamil Nadu - 641018',
      chennaiOffice: 'Old Mahabalipuram Road (OMR), Perungudi, Chennai - 600096',
      defaultTimeZone: 'Asia/Kolkata',
      defaultCurrency: 'INR (₹)',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ta'],
      leadSources: ['Website Enquiry', 'Site Visit Request', 'Phone Call', 'Direct Walk-in', 'Channel Partner'],
      operationalHours: 'Monday - Saturday: 9:00 AM - 7:00 PM IST',
      integrations: {
        database: 'MongoDB Production Cluster (Connected)',
        geminiAi: Boolean(process.env.GEMINI_API_KEY) ? 'Configured & Active' : 'Fallback / Not Configured',
        emailSmtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER) ? 'Configured & Active' : 'Not Configured (Operational Tokens Logged to Console)',
        paymentGateway: 'Manual Bank Transfer / UPI Direct Records (Live Gateway Mocked in Scope)',
      },
    };

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    successResponse(res, settingsMap);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      if (['integrations', '_id', 'createdAt', 'updatedAt'].includes(key)) continue;

      await SystemSetting.findOneAndUpdate(
        { key },
        {
          key,
          value,
          description: `Configured setting for ${key}`,
          group: 'general',
          isPublic: false,
        },
        { upsert: true, new: true }
      );
    }

    await AuditLog.create({
      user: req.user?.userId ? (req.user.userId as any) : undefined,
      userEmail: req.user?.email,
      action: 'SETTINGS_UPDATED',
      module: 'SETTINGS',
      changes: updates,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    successResponse(res, updates, 'Settings updated successfully');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

