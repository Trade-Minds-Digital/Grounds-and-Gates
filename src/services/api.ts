/**
 * Grounds & Gates - Complete Production REST API Client
 * Connects React Frontend to the Express 4.x + MongoDB Backend
 */

import { Property, EnquirySubmission, PropertyFilterState, ListingStatus, MapMarkerItem } from '../types/property';
import { Lead, SiteVisit, Booking, DemoNotification, Developer, Project, Employee, Customer, Activity } from '../types/demo';
import { MasterItem, MasterGroupSummary, MasterUsageReport, WebContentSection } from '../types/masters';

import { ApiError, normalizeError } from './apiClient';
import { getCurrentFirebaseToken } from '../config/firebase';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem('gg_auth_token');
    } catch {}
  }

  setToken(token: string | null) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('gg_auth_token', token);
      } else {
        localStorage.removeItem('gg_auth_token');
      }
    } catch {}
  }

  getToken(): string | null {
    return this.token;
  }

  async getTokenAsync(forceRefresh = false): Promise<string | null> {
    const fbToken = await getCurrentFirebaseToken(forceRefresh);
    if (fbToken) {
      this.token = fbToken;
      return fbToken;
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = await this.getTokenAsync();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let code = `HTTP_${response.status}`;
        let fieldErrors: Record<string, string> | undefined = undefined;
        let details: any = undefined;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          code = errorData.code || code;
          fieldErrors = errorData.fieldErrors || (errorData.errors && typeof errorData.errors === 'object' ? errorData.errors : undefined);
          details = errorData.details || errorData.data;
        } catch {}

        // Single safe refresh-and-retry on expired token for idempotent queries
        if (response.status === 401 && code === 'TOKEN_EXPIRED' && !isRetry && (options.method === 'GET' || !options.method)) {
          const freshToken = await this.getTokenAsync(true);
          if (freshToken) {
            return this.request<T>(endpoint, options, true);
          }
        }

        throw new ApiError({
          status: response.status,
          code,
          message: errorMessage,
          fieldErrors,
          details,
        });
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw normalizeError(err);
    }
  }

  // ─── Firebase Authentication & Profile Sync ──────
  async onboarding(data: {
    fullName: string;
    mobile: string;
    accountUsage?: 'buyer' | 'seller' | 'both';
    role?: 'buyer' | 'seller';
    address?: { street?: string; locality?: string; city?: string; district?: string; state?: string; pincode?: string };
    sellerDetails?: any;
    consents?: { termsAccepted: boolean; termsPolicyVersion?: string; marketingConsent?: boolean };
    termsAccepted?: boolean;
    marketingConsent?: boolean;
  }) {
    return this.request<{ user: any }>('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async syncVerification() {
    return this.request<{ emailVerified: boolean; email: string; message: string }>('/auth/sync-verification', {
      method: 'POST',
    });
  }

  async updateProfile(data: any) {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getMigrationStatus(dryRun = true) {
    return this.request<any>(`/auth/migration/status?dryRun=${dryRun}`);
  }

  // ─── Legacy / Compatibility Authentication ────────
  async login(credentials: { email: string; password: string }) {
    const res = await this.request<{ user: any; accessToken: string; refreshToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }

  async register(data: { fullName: string; email: string; password: string; mobile?: string; phone?: string; role?: string }) {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      mobile: data.mobile || data.phone || '9842271000',
      role: data.role || 'buyer',
    };
    const res = await this.request<{ user: any; accessToken: string; refreshToken?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {}
    this.setToken(null);
  }

  // ─── Properties ──────────────────────────────────
  async getProperties(filters: Partial<PropertyFilterState> = {}, page = 1, limit = 50): Promise<{ data: Property[]; pagination?: any }> {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.district && filters.district !== 'All' && filters.district !== 'all') params.append('district', filters.district);
    if (filters.locality && filters.locality !== 'all') params.append('locality', filters.locality);
    if (filters.ownershipType && filters.ownershipType !== 'all') params.append('ownershipType', filters.ownershipType);
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.bedrooms && filters.bedrooms !== 'all') params.append('bedrooms', String(filters.bedrooms));
    if (filters.facing && filters.facing !== 'all') params.append('facing', filters.facing);
    if (filters.featuredOnly) params.append('featuredOnly', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.nearLat !== undefined && filters.nearLat !== null) params.append('nearLat', String(filters.nearLat));
    if (filters.nearLng !== undefined && filters.nearLng !== null) params.append('nearLng', String(filters.nearLng));
    if (filters.radius !== undefined && filters.radius !== null) params.append('radius', String(filters.radius));
    if (filters.bbox) params.append('bbox', filters.bbox);
    if (filters.locationStatus && filters.locationStatus !== 'all') params.append('locationStatus', filters.locationStatus);
    params.append('page', String(page));
    params.append('limit', String(limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/properties${qs}`);
    if (Array.isArray(res)) {
      return { data: res };
    }
    return { data: res || [], pagination: (res as any)?.pagination };
  }

  async getMapMarkers(filters: Partial<PropertyFilterState> = {}): Promise<MapMarkerItem[]> {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.district && filters.district !== 'All' && filters.district !== 'all') params.append('district', filters.district);
    if (filters.listingType && filters.listingType !== 'all') params.append('listingType', filters.listingType);
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.nearLat !== undefined && filters.nearLat !== null) params.append('nearLat', String(filters.nearLat));
    if (filters.nearLng !== undefined && filters.nearLng !== null) params.append('nearLng', String(filters.nearLng));
    if (filters.radius !== undefined && filters.radius !== null) params.append('radius', String(filters.radius));
    if (filters.bbox) params.append('bbox', filters.bbox);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/properties/map-markers${qs}`);
    return Array.isArray(res) ? res : ((res as any)?.data || []);
  }

  async getPropertyByIdOrSlug(idOrSlug: string): Promise<Property | null> {
    try {
      return await this.request<Property>(`/properties/${idOrSlug}`);
    } catch (err) {
      return null;
    }
  }

  async getSellerProperty(idOrSlug: string): Promise<Property | null> {
    try {
      return await this.request<Property>(`/properties/seller/${idOrSlug}`);
    } catch (err) {
      return null;
    }
  }

  async getMySellerProperties(): Promise<Property[]> {
    try {
      const res = await this.request<any>('/properties/seller/mine');
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    } catch (err) {
      return [];
    }
  }

  async getAdminProperty(idOrSlug: string): Promise<Property | null> {
    try {
      return await this.request<Property>(`/properties/admin/review/${idOrSlug}`);
    } catch (err) {
      return null;
    }
  }

  async getAdminProperties(filters: any = {}, page = 1, limit = 100): Promise<{ data: Property[]; total: number }> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (filters.publishingStatus && filters.publishingStatus !== 'all') params.append('publishingStatus', filters.publishingStatus);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.district && filters.district !== 'all' && filters.district !== 'All') params.append('district', filters.district);
    if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/properties/manage${qs}`);
    return {
      data: Array.isArray(res) ? res : ((res as any)?.data || []),
      total: (res as any)?.pagination?.total || (Array.isArray(res) ? res.length : 0),
    };
  }

  async updatePropertyPublishStatus(
    id: string,
    publishingStatus: 'published' | 'pending-review' | 'draft' | 'rejected' | 'archived',
    rejectionReason?: string,
    notes?: string
  ): Promise<Property> {
    return this.request<Property>(`/properties/${id}/publish-status`, {
      method: 'PATCH',
      body: JSON.stringify({ publishingStatus, rejectionReason, notes }),
    });
  }

  async getMyDraftProperty(): Promise<Property | null> {
    try {
      const res = await this.request<any>('/properties/drafts/mine');
      return res || null;
    } catch (err) {
      return null;
    }
  }

  async createProperty(property: Partial<Property>): Promise<Property> {
    return this.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    return this.request<Property>(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updatePropertyStatus(id: string, status: ListingStatus): Promise<Property> {
    return this.request<Property>(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteProperty(id: string): Promise<void> {
    return this.request(`/properties/${id}`, { method: 'DELETE' });
  }

  // ─── Projects & Developers ───────────────────────
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProjectByIdOrSlug(idOrSlug: string): Promise<Project | null> {
    return this.request<Project>(`/projects/${idOrSlug}`);
  }

  async getDevelopers(): Promise<Developer[]> {
    return this.request<Developer[]>('/developers');
  }

  // ─── Employees & Customers ────────────────────────
  async getEmployees(): Promise<Employee[]> {
    try {
      return await this.request<Employee[]>('/employees');
    } catch {
      return [];
    }
  }

  async getCustomers(options: { signal?: AbortSignal } = {}): Promise<Customer[]> {
    return this.request<Customer[]>('/customers', options);
  }

  // ─── Leads & CRM ─────────────────────────────────
  async getLeads(
    filters: { stage?: string; priority?: string; search?: string } = {},
    options: { signal?: AbortSignal } = {}
  ): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters.stage && filters.stage !== 'all') params.append('stage', filters.stage);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Lead[]>(`/leads${qs}`, options);
  }

  async getLeadById(id: string, options: { signal?: AbortSignal } = {}): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`, options);
  }

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLeadStage(id: string, stage: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  }

  async assignLead(id: string, employeeId: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ employeeId }),
    });
  }

  // ─── Enquiries ───────────────────────────────────
  async createEnquiry(enquiry: {
    propertyId: string;
    fullName: string;
    phone: string;
    email: string;
    message?: string;
    visitDate?: string;
    preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
  }): Promise<{ enquiry: EnquirySubmission; leadId?: string; visitId?: string }> {
    return this.request<{ enquiry: EnquirySubmission; leadId?: string; visitId?: string }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    });
  }

  async getMyEnquiries(): Promise<EnquirySubmission[]> {
    return this.request<EnquirySubmission[]>('/enquiries/my-enquiries');
  }

  async getSellerLeads(): Promise<EnquirySubmission[]> {
    return this.request<EnquirySubmission[]>('/enquiries/seller-leads');
  }

  // ─── Site Visits ─────────────────────────────────
  async getSiteVisits(
    filters: { status?: string; date?: string } = {},
    options: { signal?: AbortSignal } = {}
  ): Promise<SiteVisit[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<SiteVisit[]>(`/site-visits${qs}`, options);
  }

  async scheduleSiteVisit(visitData: Partial<SiteVisit>): Promise<SiteVisit> {
    return this.request<SiteVisit>('/site-visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  }

  async createSiteVisit(visitData: Partial<SiteVisit>): Promise<SiteVisit> {
    return this.scheduleSiteVisit(visitData);
  }

  async updateSiteVisit(id: string, updates: Partial<SiteVisit>): Promise<SiteVisit> {
    return this.request<SiteVisit>(`/site-visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ─── Bookings ────────────────────────────────────
  async getBookings(
    filters: { status?: string } = {},
    options: { signal?: AbortSignal } = {}
  ): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Booking[]>(`/bookings${qs}`, options);
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ─── Dashboard Analytics ─────────────────────────
  async getDashboardAnalytics(params?: { dateRange?: string; includeSample?: boolean }) {
    const q = new URLSearchParams();
    if (params?.dateRange) q.append('dateRange', params.dateRange);
    if (params?.includeSample !== undefined) q.append('includeSample', String(params.includeSample));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request<any>(`/analytics/dashboard${qs}`);
  }

  // ─── Notifications ───────────────────────────────
  async getNotifications(): Promise<{ notifications: DemoNotification[]; unreadCount: number }> {
    return this.request<{ notifications: DemoNotification[]; unreadCount: number }>('/notifications');
  }

  async markNotificationRead(id: string): Promise<DemoNotification> {
    return this.request<DemoNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  // ─── Favorites & Comparisons ─────────────────────
  async getFavorites(): Promise<{ properties: Property[]; propertyIds: string[] }> {
    return this.request<{ properties: Property[]; propertyIds: string[] }>('/favorites');
  }

  async toggleFavorite(propertyId: string): Promise<{ isSaved: boolean; propertyId: string }> {
    return this.request<{ isSaved: boolean; propertyId: string }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  }

  async getComparison(): Promise<{ properties: Property[]; propertyIds: string[] }> {
    return this.request<{ properties: Property[]; propertyIds: string[] }>('/comparisons');
  }

  async updateComparison(propertyIds: string[]): Promise<any> {
    return this.request('/comparisons', {
      method: 'POST',
      body: JSON.stringify({ propertyIds }),
    });
  }

  // ─── Media & Document Upload ──────────────────────
  async uploadMedia(file: File): Promise<{ url: string; filename: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Image upload failed: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data || json;
  }

  async uploadVideo(file: File): Promise<{ url: string; filename: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/video`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Video upload failed: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data || json;
  }

  async uploadDocument(file: File): Promise<{ url: string; filename: string; originalName: string; isPrivate: boolean }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/document`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Document upload failed: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data || json;
  }

  // ─── Admin Password Reset & Staff Management ─────
  async forgotPassword(email: string) {
    return this.request<{ message: string; hasEmailProvider: boolean; resetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async getStaffUsers(options: { signal?: AbortSignal } = {}) {
    return this.request<any[]>('/auth/users', options);
  }

  async createStaffUser(data: { fullName: string; email: string; password: string; mobile: string; role: string }) {
    return this.request<any>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStaffUser(id: string, updates: any) {
    return this.request<any>(`/auth/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updateStaffStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    return this.request<any>(`/auth/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async reassignStaffRecords(fromUserId: string, toUserId: string) {
    return this.request<any>('/auth/users/reassign', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, toUserId }),
    });
  }

  // ─── Tasks & Follow-ups ───────────────────────────
  async getTasks(filters: Record<string, string> = {}, options: { signal?: AbortSignal } = {}) {
    const params = new URLSearchParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/tasks${qs}`, options);
  }

  async createTask(taskData: any) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, updates: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // ─── Audit Logs ──────────────────────────────────
  async getAuditLogs(filters: Record<string, string> = {}, options: { signal?: AbortSignal } = {}) {
    const params = new URLSearchParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/audit-logs${qs}`, options);
  }

  // ─── System Settings ─────────────────────────────
  async getSettings(options: { signal?: AbortSignal } = {}) {
    return this.request<Record<string, any>>('/settings', options);
  }

  async updateSettings(settings: Record<string, any>) {
    return this.request<Record<string, any>>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ─── Reports & Exports ───────────────────────────
  async getReportsSummary(options: { signal?: AbortSignal } = {}) {
    return this.request<any>('/reports/summary', options);
  }

  async checkDuplicateLead(email: string, phone: string) {
    return this.request<{ duplicates: any[]; hasDuplicate: boolean }>('/leads/check-duplicate', {
      method: 'POST',
      body: JSON.stringify({ email, phone }),
    });
  }

  async mergeLeads(primaryLeadId: string, secondaryLeadId: string) {
    return this.request<any>('/leads/merge', {
      method: 'POST',
      body: JSON.stringify({ primaryLeadId, secondaryLeadId }),
    });
  }

  // ─── Centralized Master Management ────────────────
  async getPublicMasters(type?: string, parentCode?: string, group?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (parentCode) params.append('parentCode', parentCode);
    if (group) params.append('group', group);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<MasterItem[]>(`/masters/public${qs}`);
  }

  async getPublicMastersBatch() {
    return this.request<Record<string, MasterItem[]>>('/masters/public/batch');
  }

  async getMasterGroups() {
    return this.request<MasterGroupSummary[]>('/masters/groups');
  }

  async getMasters(filters: {
    type?: string;
    group?: string;
    parentCode?: string;
    isActive?: boolean | string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.group) params.append('group', filters.group);
    if (filters.parentCode) params.append('parentCode', filters.parentCode);
    if (filters.isActive !== undefined && filters.isActive !== '') params.append('isActive', String(filters.isActive));
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ items: MasterItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/masters${qs}`);
  }

  async getMaster(type: string, idOrCode: string) {
    return this.request<MasterItem>(`/masters/${type}/${idOrCode}`);
  }

  async createMaster(type: string, data: Partial<MasterItem>) {
    return this.request<MasterItem>(`/masters/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaster(type: string, id: string, data: Partial<MasterItem>) {
    return this.request<MasterItem>(`/masters/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleMasterStatus(type: string, id: string, isActive?: boolean) {
    return this.request<MasterItem>(`/masters/${type}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async getMasterUsage(type: string, id: string) {
    return this.request<MasterUsageReport>(`/masters/${type}/${id}/usage`);
  }

  async deleteMaster(type: string, id: string) {
    return this.request<{ message: string }>(`/masters/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  async getMastersMigrationReport(dryRun = true) {
    return this.request<any>(`/masters/migration/report?dryRun=${dryRun}`);
  }

  // ─── Website Content Management ───────────────────
  async getPublicContent(section?: string) {
    const endpoint = section ? `/content/public/${section}` : '/content/public';
    return this.request<any>(endpoint);
  }

  async getContentSections() {
    return this.request<WebContentSection[]>('/content');
  }

  async getContentSection(section: string) {
    return this.request<WebContentSection>(`/content/${section}`);
  }

  async saveContentDraft(section: string, data: { title?: string; titleTa?: string; subtitle?: string; subtitleTa?: string; draftContent: any }) {
    return this.request<WebContentSection>(`/content/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async publishContent(section: string) {
    return this.request<WebContentSection>(`/content/${section}/publish`, {
      method: 'POST',
    });
  }

  async discardContentDraft(section: string) {
    return this.request<WebContentSection>(`/content/${section}/discard`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
