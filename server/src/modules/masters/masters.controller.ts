import { Response } from 'express';
import mongoose from 'mongoose';
import { MasterItem, MasterGroup } from '../../models/MasterItem.js';
import { Property } from '../../models/Property.js';
import { Lead } from '../../models/Lead.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Booking } from '../../models/Booking.js';
import { Employee } from '../../models/Employee.js';
import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

/**
 * Public Safe Lookup: Returns active masters with public attributes only.
 */
export const getPublicMasters = async (req: any, res: Response): Promise<void> => {
  try {
    const { type, parentCode, group } = req.query;
    const filter: Record<string, any> = { isActive: true };

    if (type) filter.type = String(type).toLowerCase().trim();
    if (group) filter.group = String(group).toLowerCase().trim();
    if (parentCode) filter.parentCode = String(parentCode).toLowerCase().trim();

    const items = await MasterItem.find(filter)
      .select('type group code name nameTa description parentCode displayOrder metadata')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    successResponse(res, items);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Public Safe Batch Lookup: Returns all active public-facing masters grouped by type.
 */
export const getPublicMastersBatch = async (_req: any, res: Response): Promise<void> => {
  try {
    const publicTypes = [
      'country',
      'state',
      'district',
      'city',
      'locality',
      'regional_hub',
      'property_category',
      'property_subcategory',
      'property_type',
      'transaction_type',
      'ownership_type',
      'amenity',
      'facing_direction',
      'road_type',
      'area_unit',
      'approval_authority',
      'document_type',
      'property_feature',
      'lead_source',
      'lead_priority',
      'visit_purpose',
      'visit_time_slot',
      'payment_method',
    ];

    const items = await MasterItem.find({
      type: { $in: publicTypes },
      isActive: true,
    })
      .select('type group code name nameTa parentCode displayOrder metadata')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const grouped: Record<string, any[]> = {};
    for (const t of publicTypes) {
      grouped[t] = [];
    }

    for (const item of items) {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    }

    successResponse(res, grouped);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Summary breakdown of groups and types with counts.
 */
export const getMasterGroups = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const summary = await MasterItem.aggregate([
      {
        $group: {
          _id: { group: '$group', type: '$type' },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] },
          },
        },
      },
      { $sort: { '_id.group': 1, '_id.type': 1 } },
    ]);

    const formatted = summary.map((s) => ({
      group: s._id.group,
      type: s._id.type,
      totalCount: s.count,
      activeCount: s.activeCount,
    }));

    successResponse(res, formatted);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Query masters with server-side pagination, search, and filtering.
 */
export const getMasters = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, group, parentCode, isActive, search, page = '1', limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (type) filter.type = String(type).toLowerCase().trim();
    if (group) filter.group = String(group).toLowerCase().trim();
    if (parentCode) filter.parentCode = String(parentCode).toLowerCase().trim();
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameTa: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      MasterItem.find(filter)
        .sort({ displayOrder: 1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MasterItem.countDocuments(filter),
    ]);

    successResponse(res, {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Get single master item by ID or Code.
 */
export const getMasterByIdOrCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, idOrCode } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrCode);

    const filter: Record<string, any> = { type: type.toLowerCase() };
    if (isObjectId) {
      filter.$or = [{ _id: idOrCode }, { code: idOrCode.toLowerCase() }];
    } else {
      filter.code = idOrCode.toLowerCase();
    }

    const item = await MasterItem.findOne(filter);
    if (!item) {
      errorResponse(res, `Master item not found for type '${type}' and identifier '${idOrCode}'`, 404);
      return;
    }

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Create a new master item.
 */
export const createMaster = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const {
      group,
      code,
      name,
      nameTa,
      description,
      parentCode,
      parentId,
      displayOrder,
      isActive,
      metadata,
    } = req.body;

    if (!code || !name) {
      errorResponse(res, 'Both unique stable code and display name are required.', 400);
      return;
    }

    const normalizedCode = String(code).trim().toLowerCase();
    const normalizedType = String(type).trim().toLowerCase();

    // Check code uniqueness within type
    const existing = await MasterItem.findOne({ type: normalizedType, code: normalizedCode });
    if (existing) {
      errorResponse(res, `A master record with code '${normalizedCode}' already exists for type '${normalizedType}'.`, 409);
      return;
    }

    // Determine group if not explicitly provided
    let masterGroup: MasterGroup = group;
    if (!masterGroup) {
      if (['country', 'state', 'district', 'city', 'locality', 'regional_hub', 'pincode'].includes(normalizedType)) {
        masterGroup = 'location';
      } else if (['property_category', 'property_subcategory', 'property_type', 'transaction_type', 'ownership_type', 'amenity', 'facing_direction', 'road_type', 'area_unit', 'approval_authority', 'document_type', 'property_feature'].includes(normalizedType)) {
        masterGroup = 'property';
      } else if (['lead_source', 'lead_priority', 'lost_lead_reason', 'follow_up_type', 'task_category', 'visit_purpose', 'visit_time_slot', 'cancellation_reason', 'booking_cancellation_reason', 'payment_method', 'payment_adjustment_reason'].includes(normalizedType)) {
        masterGroup = 'crm';
      } else if (['branch', 'department', 'designation', 'team'].includes(normalizedType)) {
        masterGroup = 'organization';
      } else {
        masterGroup = 'content';
      }
    }

    const newItem = await MasterItem.create({
      type: normalizedType,
      group: masterGroup,
      code: normalizedCode,
      name: String(name).trim(),
      nameTa: nameTa ? String(nameTa).trim() : '',
      description: description ? String(description).trim() : '',
      parentCode: parentCode ? String(parentCode).trim().toLowerCase() : undefined,
      parentId: parentId || undefined,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      metadata: metadata || {},
      createdBy: (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any,
      updatedBy: (req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined) as any,
    });

    await AuditLog.create({
      userId: req.user?.userId,
      userEmail: req.user?.email || 'system',
      userRole: req.user?.role || 'admin',
      action: 'CREATE',
      module: 'SETTINGS',
      resourceId: String(newItem._id),
      details: {
        masterType: normalizedType,
        code: normalizedCode,
        name: newItem.name,
      },
    });

    successResponse(res, newItem, 'Master item created successfully.', 201);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Update master item.
 */
export const updateMaster = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const {
      name,
      nameTa,
      description,
      parentCode,
      parentId,
      displayOrder,
      isActive,
      metadata,
      code,
    } = req.body;

    const item = await MasterItem.findOne({ _id: id, type: type.toLowerCase() });
    if (!item) {
      errorResponse(res, 'Master item not found.', 404);
      return;
    }

    // System masters cannot alter their stable system code
    if (code && code.toLowerCase() !== item.code) {
      if (item.isSystem) {
        errorResponse(res, 'Cannot alter the stable system code of a system-defined master. You can update display names, descriptions, and ordering.', 400);
        return;
      }
      // Check code uniqueness
      const existing = await MasterItem.findOne({
        type: item.type,
        code: code.toLowerCase(),
        _id: { $ne: item._id },
      });
      if (existing) {
        errorResponse(res, `Code '${code}' is already in use by another item of this type.`, 409);
        return;
      }
      item.code = code.toLowerCase().trim();
    }

    if (name) item.name = String(name).trim();
    if (nameTa !== undefined) item.nameTa = String(nameTa).trim();
    if (description !== undefined) item.description = String(description).trim();
    if (parentCode !== undefined) item.parentCode = parentCode ? String(parentCode).trim().toLowerCase() : undefined;
    if (parentId !== undefined) item.parentId = parentId || undefined;
    if (typeof displayOrder === 'number') item.displayOrder = displayOrder;
    if (typeof isActive === 'boolean') item.isActive = isActive;
    if (metadata !== undefined) item.metadata = metadata;
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
        masterType: item.type,
        code: item.code,
        name: item.name,
      },
    });

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Toggle master active status.
 */
export const toggleMasterStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const { isActive } = req.body;

    const item = await MasterItem.findOne({ _id: id, type: type.toLowerCase() });
    if (!item) {
      errorResponse(res, 'Master item not found.', 404);
      return;
    }

    item.isActive = typeof isActive === 'boolean' ? isActive : !item.isActive;
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
        action: 'TOGGLE_STATUS',
        masterType: item.type,
        code: item.code,
        isActive: item.isActive,
      },
    });

    successResponse(res, item);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Dependency and usage check across business entities.
 */
export const getMasterUsage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const item = await MasterItem.findOne({ _id: id, type: type.toLowerCase() });
    if (!item) {
      errorResponse(res, 'Master item not found.', 404);
      return;
    }

    const { code, name } = item;
    const codeOrNameRegex = new RegExp(`^(${code}|${name})$`, 'i');

    const [propCount, leadCount, visitCount, bkgCount, empCount, childCount] = await Promise.all([
      // Check Property references
      Property.countDocuments({
        $or: [
          { category: codeOrNameRegex },
          { propertyType: codeOrNameRegex },
          { district: codeOrNameRegex },
          { city: codeOrNameRegex },
          { locality: codeOrNameRegex },
          { facing: codeOrNameRegex },
          { plotAreaUnit: codeOrNameRegex },
          { approvalAuthority: codeOrNameRegex },
          { amenities: codeOrNameRegex },
        ],
      }),
      // Check Lead references
      Lead.countDocuments({
        $or: [
          { source: codeOrNameRegex },
          { stage: codeOrNameRegex },
          { priority: codeOrNameRegex },
        ],
      }),
      // Check Site Visit references
      SiteVisit.countDocuments({
        $or: [
          { timeSlot: codeOrNameRegex },
          { status: codeOrNameRegex },
        ],
      }),
      // Check Booking references
      Booking.countDocuments({
        $or: [
          { paymentMethod: codeOrNameRegex },
          { status: codeOrNameRegex },
        ],
      }),
      // Check Employee references
      Employee.countDocuments({
        $or: [
          { department: codeOrNameRegex },
          { designation: codeOrNameRegex },
          { district: codeOrNameRegex },
        ],
      }),
      // Check child master items (e.g. localities under a district)
      MasterItem.countDocuments({ parentCode: code }),
    ]);

    const totalUsage = propCount + leadCount + visitCount + bkgCount + empCount + childCount;

    successResponse(res, {
      code,
      name,
      type: item.type,
      isSystem: item.isSystem,
      totalUsage,
      references: {
        properties: propCount,
        leads: leadCount,
        siteVisits: visitCount,
        bookings: bkgCount,
        employees: empCount,
        childMasters: childCount,
      },
    });
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Delete master with dependency protection.
 */
export const deleteMaster = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const item = await MasterItem.findOne({ _id: id, type: type.toLowerCase() });
    if (!item) {
      errorResponse(res, 'Master item not found.', 404);
      return;
    }

    // 1. Block deletion of system codes
    if (item.isSystem) {
      errorResponse(res, `System master '${item.name}' (${item.code}) cannot be deleted. You can deactivate it instead to prevent new selections.`, 400);
      return;
    }

    // 2. Check usage across all business collections
    const { code, name } = item;
    const codeOrNameRegex = new RegExp(`^(${code}|${name})$`, 'i');

    const [propCount, leadCount, visitCount, bkgCount, empCount, childCount] = await Promise.all([
      Property.countDocuments({
        $or: [
          { category: codeOrNameRegex },
          { propertyType: codeOrNameRegex },
          { district: codeOrNameRegex },
          { city: codeOrNameRegex },
          { locality: codeOrNameRegex },
          { facing: codeOrNameRegex },
          { plotAreaUnit: codeOrNameRegex },
          { approvalAuthority: codeOrNameRegex },
          { amenities: codeOrNameRegex },
        ],
      }),
      Lead.countDocuments({
        $or: [
          { source: codeOrNameRegex },
          { stage: codeOrNameRegex },
          { priority: codeOrNameRegex },
        ],
      }),
      SiteVisit.countDocuments({
        $or: [{ timeSlot: codeOrNameRegex }, { status: codeOrNameRegex }],
      }),
      Booking.countDocuments({
        $or: [{ paymentMethod: codeOrNameRegex }, { status: codeOrNameRegex }],
      }),
      Employee.countDocuments({
        $or: [{ department: codeOrNameRegex }, { designation: codeOrNameRegex }],
      }),
      MasterItem.countDocuments({ parentCode: code }),
    ]);

    const totalUsage = propCount + leadCount + visitCount + bkgCount + empCount + childCount;
    if (totalUsage > 0) {
      errorResponse(
        res,
        `Cannot delete '${item.name}' because it is actively referenced in ${totalUsage} records (${propCount} properties, ${leadCount} leads, ${visitCount} visits, ${bkgCount} bookings, ${childCount} child masters). Please deactivate it instead or reassign existing records.`,
        409
      );
      return;
    }

    await MasterItem.deleteOne({ _id: item._id });

    await AuditLog.create({
      userId: req.user?.userId,
      userEmail: req.user?.email || 'system',
      userRole: req.user?.role || 'admin',
      action: 'DELETE',
      module: 'SETTINGS',
      resourceId: String(item._id),
      details: {
        masterType: item.type,
        code: item.code,
        name: item.name,
      },
    });

    successResponse(res, { message: `Master item '${item.name}' deleted successfully.` });
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * Protected: Dry-run or execute masters reconciliation report.
 */
export const getMigrationReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { runMastersMigration } = await import('../../database/mastersMigration.js');
    const isDryRun = req.query.dryRun !== 'false';
    const report = await runMastersMigration(isDryRun);
    successResponse(res, report);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

