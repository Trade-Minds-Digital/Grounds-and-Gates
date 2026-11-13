/**
 * Grounds & Gates - Unified API Client & State Sync Layer
 * Connects frontend SPA to the Fastify 5 REST API Backend
 */

import { Property, EnquirySubmission, PropertyFilterState } from '../types/property';
import { INITIAL_PROPERTIES } from '../data/properties';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

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

    return response.json();
  }

  // ─── Authentication ──────────────────────────────
  async login(credentials: { email: string; password: string }) {
    const res = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: { fullName: string; email: string; password: string; phone: string; role: string }) {
    const res = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async getProfile() {
    return this.request<any>('/users/profile');
  }

  logout() {
    this.setToken(null);
  }

  // ─── Properties ──────────────────────────────────
  async getProperties(filters: Partial<PropertyFilterState> = {}): Promise<{ data: Property[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.district && filters.district !== 'All') params.append('district', filters.district);
      if (filters.ownershipType) params.append('ownershipType', filters.ownershipType);
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const qs = params.toString() ? `?${params.toString()}` : '';
      return await this.request<{ data: Property[]; pagination?: any }>(`/properties${qs}`);
    } catch (err) {
      // Offline / disconnected fallback: Return client-side seed data
      console.warn('Backend API unavailable, falling back to local dataset:', err);
      return { data: INITIAL_PROPERTIES };
    }
  }

  async getPropertyByIdOrSlug(idOrSlug: string): Promise<Property | null> {
    try {
      return await this.request<Property>(`/properties/${idOrSlug}`);
    } catch (err) {
      const found = INITIAL_PROPERTIES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
      return found || null;
    }
  }

  async createProperty(property: Partial<Property>): Promise<Property> {
    return this.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
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
  }): Promise<EnquirySubmission> {
    return this.request<EnquirySubmission>('/enquiries', {
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

  async updateEnquiryStatus(id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
    return this.request<EnquirySubmission>(`/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ─── AI Property Assistant (Secure Backend Proxy) ─
  async askAiAssistant(message: string, lang: 'en' | 'ta' = 'en') {
    return this.request<{
      reply: string;
      matchedProperties: Property[];
      lang: 'en' | 'ta';
    }>('/ai/property-assistant', {
      method: 'POST',
      body: JSON.stringify({ message, lang }),
    });
  }

  // ─── Media Upload ────────────────────────────────
  async uploadMedia(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const api = new ApiClient();
