import { UserRole } from '../types/property';

export type CrmModule =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'properties'
  | 'projects'
  | 'site-visits'
  | 'bookings'
  | 'tasks'
  | 'team'
  | 'reports'
  | 'audit-log'
  | 'settings'
  | 'masters'
  | 'content';

export const STAFF_ROLES: UserRole[] = [
  'super-admin',
  'admin',
  'sales-manager',
  'sales-executive',
  'listing-manager',
];

export const isStaffRole = (role?: string | null): boolean => {
  if (!role) return false;
  return STAFF_ROLES.includes(role as UserRole);
};

export const isSellerRole = (role?: string | null): boolean => {
  return role === 'seller';
};

export const isBuyerRole = (role?: string | null): boolean => {
  return role === 'buyer';
};

// ─── Exact Backend Route Role Helpers ─────────────────────────────
// Aligned 1:1 with backend Express route middleware (requireRole)

export const canReadCustomers = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive'].includes(role || '');

export const canReadTasks = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive'].includes(role || '');

export const canReadTeam = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager'].includes(role || '');

export const canManageTeam = (role?: string | null): boolean =>
  ['super-admin', 'admin'].includes(role || '');

export const canReadReports = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager'].includes(role || '');

export const canReadAuditLogs = (role?: string | null): boolean =>
  ['super-admin', 'admin'].includes(role || '');

export const canReadAdminContent = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'listing-manager'].includes(role || '');

export const canModifyContent = (role?: string | null): boolean =>
  ['super-admin', 'admin'].includes(role || '');

export const canReadAdminMasters = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'].includes(role || '');

export const canModifyMasters = (role?: string | null): boolean =>
  ['super-admin', 'admin'].includes(role || '');

export const canReadAdminProperties = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'listing-manager', 'sales-manager'].includes(role || '');

export const canPublishProperties = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'listing-manager'].includes(role || '');

export const canReadSellerProperties = (role?: string | null): boolean =>
  ['seller', 'super-admin', 'admin', 'listing-manager', 'sales-manager', 'sales-executive', 'agent', 'developer'].includes(role || '');

export const canReadLeads = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'seller'].includes(role || '');

export const canReadBookings = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'seller', 'buyer'].includes(role || '');

export const canReadSiteVisits = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'seller', 'buyer'].includes(role || '');

export const canReadSettings = (role?: string | null): boolean =>
  ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'].includes(role || '');

export const canModifySettings = (role?: string | null): boolean =>
  role === 'super-admin';

export const ROLE_MODULE_PERMISSIONS: Record<UserRole, CrmModule[]> = {
  'super-admin': [
    'dashboard',
    'leads',
    'customers',
    'properties',
    'projects',
    'site-visits',
    'bookings',
    'tasks',
    'team',
    'reports',
    'audit-log',
    'settings',
    'masters',
    'content',
  ],
  'admin': [
    'dashboard',
    'leads',
    'customers',
    'properties',
    'projects',
    'site-visits',
    'bookings',
    'tasks',
    'team',
    'reports',
    'audit-log',
    'settings',
    'masters',
    'content',
  ],
  'sales-manager': [
    'dashboard',
    'leads',
    'customers',
    'properties',
    'projects',
    'site-visits',
    'bookings',
    'tasks',
    'team',
    'reports',
  ],
  'sales-executive': [
    'dashboard',
    'leads',
    'customers',
    'site-visits',
    'bookings',
    'tasks',
  ],
  'listing-manager': [
    'dashboard',
    'properties',
    'projects',
    'masters',
    'content',
  ],
  'company-admin': [
    'dashboard',
    'properties',
    'leads',
    'bookings',
  ],
  'owner': [],
  'agent': [],
  'buyer': [],
  'seller': [],
  'developer': [],
};

/**
 * Check if a role has read/view access to a given CRM module
 */
export const canViewModule = (role: UserRole | string | undefined, module: CrmModule): boolean => {
  if (!role) return false;
  if (role === 'super-admin') return true;
  const permitted = ROLE_MODULE_PERMISSIONS[role as UserRole] || [];
  return permitted.includes(module);
};

export const hasModuleAccess = canViewModule;

/**
 * Check if a role can perform an action in a module
 */
export const canPerformAction = (
  role: UserRole | string | undefined,
  module: CrmModule,
  action: 'create' | 'read' | 'update' | 'delete' | 'assign' | 'publish'
): boolean => {
  if (!role) return false;
  if (role === 'super-admin') return true;

  if (!canViewModule(role, module)) return false;

  // Granular action rules aligned with backend RBAC
  if (action === 'delete') {
    return role === 'super-admin' || role === 'admin';
  }

  if (action === 'publish') {
    return canPublishProperties(role);
  }

  if (action === 'assign') {
    return role === 'super-admin' || role === 'admin' || role === 'sales-manager';
  }

  if (module === 'team') {
    return action === 'read' ? canReadTeam(role) : canManageTeam(role);
  }

  if (module === 'content') {
    return action === 'read' ? canReadAdminContent(role) : canModifyContent(role);
  }

  if (module === 'masters') {
    return action === 'read' ? canReadAdminMasters(role) : canModifyMasters(role);
  }

  if (module === 'reports') {
    return canReadReports(role);
  }

  if (module === 'audit-log') {
    return canReadAuditLogs(role);
  }

  if (module === 'settings') {
    return action === 'read' ? canReadSettings(role) : canModifySettings(role);
  }

  if (module === 'customers') {
    return canReadCustomers(role);
  }

  if (module === 'tasks') {
    return canReadTasks(role);
  }

  return true;
};

/**
 * Check if a user can access a specific resource by role and record ownership
 */
export const canAccessResource = (
  role: UserRole | string | undefined,
  resourceType: 'property' | 'lead' | 'booking' | 'site-visit' | 'customer' | 'task' | 'team',
  options?: {
    ownerId?: string;
    currentUserId?: string;
    assignedEmployeeId?: string;
  }
): boolean => {
  if (!role) return false;
  if (role === 'super-admin' || role === 'admin') return true;

  const { ownerId, currentUserId, assignedEmployeeId } = options || {};

  switch (resourceType) {
    case 'customer':
      return canReadCustomers(role);

    case 'team':
      return canReadTeam(role);

    case 'task':
      return canReadTasks(role);

    case 'property':
      if (canReadAdminProperties(role)) return true;
      if (canReadSellerProperties(role) && ownerId && currentUserId) {
        return ownerId === currentUserId;
      }
      return false;

    case 'lead':
      if (role === 'sales-manager') return true;
      if (role === 'sales-executive') {
        return !assignedEmployeeId || assignedEmployeeId === currentUserId;
      }
      if (role === 'seller') {
        return Boolean(ownerId && currentUserId && ownerId === currentUserId);
      }
      return false;

    case 'booking':
    case 'site-visit':
      if (['super-admin', 'admin', 'sales-manager', 'sales-executive'].includes(role)) return true;
      if (role === 'seller' || role === 'buyer') {
        return Boolean(ownerId && currentUserId && ownerId === currentUserId);
      }
      return false;

    default:
      return false;
  }
};

export const getRoleDisplayName = (role?: string, lang: 'en' | 'ta' = 'en'): string => {
  if (lang === 'ta') {
    switch (role) {
      case 'super-admin': return 'தலைமை நிர்வாகி (Super Admin)';
      case 'admin': return 'நிர்வாகி (Admin)';
      case 'sales-manager': return 'விற்பனை மேலாளர் (Sales Manager)';
      case 'sales-executive': return 'விற்பனை அதிகாரி (Sales Executive)';
      case 'listing-manager': return 'சொத்து மேலாளர் (Listing Manager)';
      case 'seller': return 'விற்பனையாளர் (Seller)';
      case 'buyer': return 'வாங்குபவர் (Buyer)';
      default: return role || 'பயனர்';
    }
  }
  switch (role) {
    case 'super-admin': return 'Super Administrator';
    case 'admin': return 'Administrator';
    case 'sales-manager': return 'Sales Manager';
    case 'sales-executive': return 'Sales Executive';
    case 'listing-manager': return 'Listing Manager';
    case 'seller': return 'Property Seller';
    case 'buyer': return 'Property Buyer';
    default: return role || 'User';
  }
};
