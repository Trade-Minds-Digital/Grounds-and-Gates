import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { WebContent } from '../../models/WebContent.js';
import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

/**
 * Public: Get all published website content.
 * Does not return drafts or unpublished sections.
 */
export const getPublicContent = async (_req: Request, res: Response): Promise<void> => {
  try {
    const published = await WebContent.find({
      $or: [{ status: 'published' }, { publishedAt: { $exists: true, $ne: null } }],
    })
      .select('section title titleTa subtitle subtitleTa content version publishedAt')
      .lean();

    const formatted: Record<string, any> = {};
    for (const item of published) {
      formatted[item.section] = {
        title: item.title,
        titleTa: item.titleTa,
        subtitle: item.subtitle,
        subtitleTa: item.subtitleTa,
        content: item.content,
        version: item.version,
        publishedAt: item.publishedAt,
      };
    }

    successResponse(res, formatted);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Public: Get single published section.
 */
export const getPublicSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const item = await WebContent.findOne({
      section: section.toLowerCase().trim(),
      $or: [{ status: 'published' }, { publishedAt: { $exists: true, $ne: null } }],
    })
      .select('section title titleTa subtitle subtitleTa content version publishedAt')
      .lean();

    if (!item) {
      errorResponse(res, `Published content for section '${section}' not found.`, 404);
      return;
    }

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Get all sections with both draft and published states.
 */
export const getAllSections = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const items = await WebContent.find().sort({ section: 1 }).lean();
    successResponse(res, items);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Get single section for admin editing.
 */
export const getSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const item = await WebContent.findOne({ section: section.toLowerCase() });

    if (!item) {
      errorResponse(res, `Section '${section}' not found.`, 404);
      return;
    }

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Save working draft. Does not modify public published content.
 */
export const saveSectionDraft = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const { title, titleTa, subtitle, subtitleTa, draftContent, content } = req.body;

    const normalizedSection = section.toLowerCase().trim();
    let item = await WebContent.findOne({ section: normalizedSection });

    // Assemble new draft payload
    const draft = draftContent !== undefined 
      ? JSON.parse(JSON.stringify(draftContent))
      : (content !== undefined ? JSON.parse(JSON.stringify(content)) : {});
    
    if (draft && typeof draft === 'object') {
      if (title !== undefined && draft.title === undefined) draft.title = title;
      if (titleTa !== undefined && draft.titleTa === undefined) draft.titleTa = titleTa;
      if (subtitle !== undefined && draft.subtitle === undefined) draft.subtitle = subtitle;
      if (subtitleTa !== undefined && draft.subtitleTa === undefined) draft.subtitleTa = subtitleTa;
    }

    if (!item) {
      item = new WebContent({
        section: normalizedSection,
        title: title || normalizedSection,
        titleTa: titleTa || '',
        subtitle: subtitle || '',
        subtitleTa: subtitleTa || '',
        content: draft,
        draftContent: draft,
        status: 'draft',
        version: 1,
        updatedBy: (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any,
      });
    } else {
      // Do NOT overwrite published live content/title yet!
      item.draftContent = draft;
      item.status = 'draft'; // Mark as having unpublished changes
      item.updatedBy = (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any;
    }

    await item.save();

    await AuditLog.create({
      userId: req.user?.userId,
      userEmail: req.user?.email || 'system',
      userRole: req.user?.role || 'admin',
      action: 'UPDATE',
      module: 'SETTINGS',
      resourceId: String(item._id),
      details: {
        action: 'SAVE_CONTENT_DRAFT',
        section: normalizedSection,
        version: item.version,
      },
    });

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Promote draft content to live published website.
 */
export const publishSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const normalizedSection = section.toLowerCase().trim();

    const item = await WebContent.findOne({ section: normalizedSection });
    if (!item) {
      errorResponse(res, `Section '${section}' not found.`, 404);
      return;
    }

    // Promote draftContent to content and published title/subtitle
    if (item.draftContent) {
      if (item.draftContent.title !== undefined) item.title = item.draftContent.title;
      if (item.draftContent.titleTa !== undefined) item.titleTa = item.draftContent.titleTa;
      if (item.draftContent.subtitle !== undefined) item.subtitle = item.draftContent.subtitle;
      if (item.draftContent.subtitleTa !== undefined) item.subtitleTa = item.draftContent.subtitleTa;
      item.content = JSON.parse(JSON.stringify(item.draftContent));
    }
    item.status = 'published';
    item.version = (item.version || 1) + 1;
    item.publishedAt = new Date();
    item.publishedBy = (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any;
    item.updatedBy = (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any;

    await item.save();

    await AuditLog.create({
      userId: req.user?.userId,
      userEmail: req.user?.email || 'system',
      userRole: req.user?.role || 'admin',
      action: 'UPDATE',
      module: 'SETTINGS',
      resourceId: String(item._id),
      details: {
        action: 'PUBLISH_CONTENT',
        section: normalizedSection,
        newVersion: item.version,
      },
    });

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Discard working draft and revert to currently published version.
 */
export const discardSectionDraft = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const normalizedSection = section.toLowerCase().trim();

    const item = await WebContent.findOne({ section: normalizedSection });
    if (!item) {
      errorResponse(res, `Section '${section}' not found.`, 404);
      return;
    }

    // Discard draftContent
    item.draftContent = null;
    item.status = 'published';
    item.updatedBy = (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any;

    await item.save();

    await AuditLog.create({
      userId: req.user?.userId,
      userEmail: req.user?.email || 'system',
      userRole: req.user?.role || 'admin',
      action: 'UPDATE',
      module: 'SETTINGS',
      resourceId: String(item._id),
      details: {
        action: 'DISCARD_CONTENT_DRAFT',
        section: normalizedSection,
      },
    });

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};
