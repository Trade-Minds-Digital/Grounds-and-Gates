import { UserRole } from './property';

export interface AdminUser {
  id: string;
  _id?: string;
  fullName: string;
  name?: string;
  email: string;
  mobile: string;
  role: UserRole;
  accountStatus: 'active' | 'inactive' | 'suspended' | 'pending';
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
}

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'scheduled'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface CrmLead {
  id: string;
  _id?: string;
  referenceId?: string;
  buyerName: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  stage: LeadStage;
  priority: 'low' | 'medium' | 'high';
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  offerAmount?: number;
  message?: string;
  scheduledVisitDate?: string | null;
  nextFollowUpDate?: string;
  notes?: string;
  source?: string;
  date?: string;
  activities?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmCustomer {
  id: string;
  _id?: string;
  referenceId?: string;
  name?: string;
  fullName?: string;
  phone: string;
  email: string;
  city?: string;
  district?: string;
  preferredCategories?: any[];
  budgetRange?: { min: number; max: number };
  budgetMin?: number;
  budgetMax?: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
}

export interface CrmTask {
  id: string;
  _id?: string;
  referenceId?: string;
  title: string;
  description?: string;
  entityType: 'lead' | 'customer' | 'property' | 'booking' | 'site-visit' | 'general';
  entityId?: string;
  entityTitle?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: string;
  completedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface CrmAuditLog {
  id: string;
  _id?: string;
  user?: {
    fullName?: string;
    email?: string;
    role?: string;
  };
  userEmail?: string;
  action: string;
  module: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface CrmSiteVisit {
  id: string;
  _id?: string;
  referenceId?: string;
  leadId?: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerPhone: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  notes?: string;
  feedback?: string;
  transportProvided?: boolean;
}

export interface CrmBooking {
  id: string;
  _id?: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerId?: string;
  tokenAmount: number;
  totalAmount: number;
  bookingDate: string;
  registrationTargetDate?: string;
  status: 'draft' | 'token-received' | 'documentation' | 'registered' | 'cancelled';
  bookingStatus?: string;
  paymentMethod: string;
  paymentStatus?: 'pending' | 'partially-paid' | 'paid' | 'confirmed' | 'refunded' | 'failed';
  paymentAdjustmentAudit?: any[];
  notes?: string;
  transactionRef?: string;
  createdAt?: string;
}

export interface DashboardMetrics {
  properties: {
    total: number;
    active: number;
    underNegotiation: number;
    sold: number;
  };
  leads: {
    total: number;
    byStage: Record<string, number>;
  };
  bookings: {
    total: number;
    totalToken: number;
    totalValue: number;
  };
  siteVisits: {
    total: number;
    upcoming: number;
  };
  districtDistribution: Array<{ district: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  recentActivities: any[];
}
