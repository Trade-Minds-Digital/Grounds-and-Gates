import { Property, PropertyCategory, ListingStatus } from './property';

export interface Developer {
  id: string;
  name: string;
  tamilName?: string;
  logo: string;
  verified: boolean;
  rating: number;
  completedProjectsCount: number;
  experienceYears: number;
  contactPhone: string;
  email: string;
  headquarters: string;
  description: string;
}

export interface Project {
  id: string;
  developerId: string;
  name: string;
  tamilName?: string;
  district: string;
  locality: string;
  status: 'pre-launch' | 'under-construction' | 'ready-to-occupy' | 'completed';
  completionYear: number;
  reraNumber: string;
  approvalAuthority: 'DTCP' | 'CMDA' | 'RERA';
  totalUnits: number;
  availableUnits: number;
  priceRange: { min: number; max: number };
  images: string[];
  description: string;
}

export type EmployeeRole = 'sales-executive' | 'crm-manager' | 'property-specialist' | 'legal-advisor';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  avatarUrl: string;
  activeDealsCount: number;
  performanceRating: number;
  specializationLocalities: string[];
  district: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  preferredCategories: PropertyCategory[];
  budgetRange: { min: number; max: number };
  enquiryIds: string[];
  bookingIds: string[];
  createdDate: string;
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'scheduled' | 'negotiation' | 'won' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  customerId: string;
  buyerName: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  stage: LeadStage;
  priority: LeadPriority;
  assignedEmployeeId: string;
  offerAmount?: number;
  message: string;
  date: string;
  scheduledVisitDate?: string | null;
  activities?: Activity[];
  createdAt: string;
  updatedAt: string;
}

export type VisitTimeSlot = 'morning' | 'afternoon' | 'evening';
export type VisitStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';

export interface SiteVisit {
  id: string;
  leadId: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  assignedEmployeeId: string;
  assignedEmployeeName?: string;
  date: string; // YYYY-MM-DD
  timeSlot: VisitTimeSlot;
  status: VisitStatus;
  feedback?: string;
  notes?: string;
  transportProvided?: boolean;
}

export type BookingStatus = 'draft' | 'token-received' | 'documentation' | 'registered' | 'cancelled';

export interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  leadId: string;
  assignedEmployeeId: string;
  tokenAmount: number;
  totalAmount: number;
  bookingDate: string;
  registrationTargetDate?: string;
  status: BookingStatus;
  paymentStatus?: 'pending' | 'partially-paid' | 'confirmed' | 'failed' | 'refunded';
  paymentMethod: 'Net Banking / RTGS' | 'UPI' | 'Demand Draft' | 'Cheque';
  paymentAdjustmentAudit?: any[];
  notes?: string;
}

export type ActivityType = 'call' | 'site-visit' | 'email' | 'status-change' | 'note' | 'token';

export interface Activity {
  id: string;
  entityType: 'lead' | 'booking' | 'property' | 'site-visit';
  entityId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  performedByEmployeeId?: string;
}

export type NotificationType = 'lead' | 'visit' | 'booking' | 'system';

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  actionView?: string;
  actionParams?: Record<string, unknown>;
}

export interface DemoStateData {
  version: number;
  lastUpdated: string;
  properties: Property[];
  developers: Developer[];
  projects: Project[];
  employees: Employee[];
  customers: Customer[];
  leads: Lead[];
  siteVisits: SiteVisit[];
  bookings: Booking[];
  activities: Activity[];
  notifications: DemoNotification[];
  savedPropertyIds: string[];
  comparedPropertyIds: string[];
}
