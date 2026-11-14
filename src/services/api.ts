/**
 * Grounds & Gates - Complete Production REST API Client
 * Connects React Frontend to the Express 4.x + MongoDB Backend
 */

import { Property, EnquirySubmission, PropertyFilterState, ListingStatus } from '../types/property';
import { Lead, SiteVisit, Booking, DemoNotification, Developer, Project, Employee, Customer, Activity } from '../types/demo';

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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  }

  // ─── Authentication ──────────────────────────────
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
    params.append('page', String(page));
    params.append('limit', String(limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/properties${qs}`);
    if (Array.isArray(res)) {
      return { data: res };
    }
    return { data: res || [], pagination: (res as any)?.pagination };
  }

  async getPropertyByIdOrSlug(idOrSlug: string): Promise<Property | null> {
    try {
      return await this.request<Property>(`/properties/${idOrSlug}`);
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

  async getCustomers(): Promise<Customer[]> {
    try {
      return await this.request<Customer[]>('/customers');
    } catch {
      return [];
    }
  }

  // ─── Leads & CRM ─────────────────────────────────
  async getLeads(filters: { stage?: string; priority?: string; search?: string } = {}): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters.stage && filters.stage !== 'all') params.append('stage', filters.stage);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Lead[]>(`/leads${qs}`);
  }

  async getLeadById(id: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`);
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
  async getSiteVisits(filters: { status?: string; date?: string } = {}): Promise<SiteVisit[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<SiteVisit[]>(`/site-visits${qs}`);
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
  async getBookings(filters: { status?: string } = {}): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Booking[]>(`/bookings${qs}`);
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
  async getDashboardAnalytics() {
    return this.request<any>('/analytics/dashboard');
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

  // ─── Media Upload ────────────────────────────────
  async uploadMedia(file: File): Promise<{ url: string; filename: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.statusText}`);
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

  async getStaffUsers() {
    return this.request<any[]>('/auth/users');
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
  async getTasks(filters: Record<string, string> = {}) {
    const params = new URLSearchParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/tasks${qs}`);
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
  async getAuditLogs(filters: Record<string, string> = {}) {
    const params = new URLSearchParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/audit-logs${qs}`);
  }

  // ─── System Settings ─────────────────────────────
  async getSettings() {
    return this.request<Record<string, any>>('/settings');
  }

  async updateSettings(settings: Record<string, any>) {
    return this.request<Record<string, any>>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ─── Reports & Exports ───────────────────────────
  async getReportsSummary() {
    return this.request<any>('/reports/summary');
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
}

export const api = new ApiClient();
