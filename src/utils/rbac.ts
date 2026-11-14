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
  | 'settings';

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
  ],
  'sales-manager': [
    'dashboard',
    'leads',
    'customers',
    'site-visits',
    'bookings',
    'tasks',
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
    'reports',
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
};

export const hasModuleAccess = (role: UserRole | string | undefined, module: CrmModule): boolean => {
  if (!role) return false;
  if (role === 'super-admin') return true;
  const permitted = ROLE_MODULE_PERMISSIONS[role as UserRole] || [];
  return permitted.includes(module);
};

export const getRoleDisplayName = (role?: string, lang: 'en' | 'ta' = 'en'): string => {
  if (lang === 'ta') {
    switch (role) {
      case 'super-admin': return 'தலைமை நிர்வாகி (Super Admin)';
      case 'admin': return 'நிர்வாகி (Admin)';
      case 'sales-manager': return 'விற்பனை மேலாளர் (Sales Manager)';
      case 'sales-executive': return 'விற்பனை அதிகாரி (Sales Executive)';
      case 'listing-manager': return 'சொத்து மேலாளர் (Listing Manager)';
      default: return role || 'அதிகாரி';
    }
  }
  switch (role) {
    case 'super-admin': return 'Super Administrator';
    case 'admin': return 'Administrator';
    case 'sales-manager': return 'Sales Manager';
    case 'sales-executive': return 'Sales Executive';
    case 'listing-manager': return 'Listing Manager';
    default: return role || 'Staff User';
  }
};

