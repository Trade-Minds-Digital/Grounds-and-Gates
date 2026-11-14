import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Developer,
  Project,
  Employee,
  Customer,
  Lead,
  LeadStage,
  SiteVisit,
  Booking,
  Activity,
  DemoNotification,
  DemoStateData
} from '../types/demo';
import { Property, ListingStatus } from '../types/property';
import { INITIAL_DEMO_STATE } from '../data/demo';
import { api } from '../services/api';

const DEMO_STORAGE_KEY = 'gg_demo_state_v1';

export interface DemoStateContextType {
  // Master Datasets
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

  // Connectivity
  isBackendConnected?: boolean;
  isLoadingBackend?: boolean;

  // Derived collections
  savedProperties: Property[];
  comparedProperties: Property[];
  unreadNotificationCount: number;

  // Query Selectors
  getPropertyById: (id: string) => Property | undefined;
  getProjectById: (id: string) => Project | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getEmployeeById: (id: string) => Employee | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getLeadById: (id: string) => Lead | undefined;
  getLeadsByStage: (stage: LeadStage) => Lead[];
  getVisitsForLead: (leadId: string) => SiteVisit[];
  getVisitsForProperty: (propertyId: string) => SiteVisit[];
  getBookingsForProperty: (propertyId: string) => Booking[];
  getActivitiesForEntity: (entityType: string, entityId: string) => Activity[];
  getProjectProperties: (projectId: string) => Property[];

  // State Mutators
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  updatePropertyStatus: (id: string, status: ListingStatus) => void;

  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  assignLead: (leadId: string, employeeId: string) => void;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;

  scheduleSiteVisit: (visitData: Omit<SiteVisit, 'id'>) => SiteVisit;
  updateSiteVisit: (id: string, updates: Partial<SiteVisit>) => void;

  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingNumber'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  addActivity: (activityData: Omit<Activity, 'id' | 'timestamp'>) => Activity;
  markNotificationRead: (id: string) => void;
  addNotification: (notifData: Omit<DemoNotification, 'id' | 'timestamp' | 'read'>) => DemoNotification;

  toggleSaveProperty: (id: string) => void;
  toggleCompareProperty: (id: string) => void;
  clearFavorites: () => void;
  clearComparison: () => void;

  // Maintenance & System
  resetDemoData: () => void;
}

const DemoStateContext = createContext<DemoStateContextType | undefined>(undefined);

export const DemoStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(true);

  // Initialize from localStorage with safe fallback to initial seed
  const [demoState, setDemoState] = useState<DemoStateData>(() => {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const parsed: DemoStateData = JSON.parse(stored);
        if (parsed.version === INITIAL_DEMO_STATE.version && Array.isArray(parsed.properties)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse demo state from localStorage, falling back to seed dataset', e);
    }
    return INITIAL_DEMO_STATE;
  });

  // Load from MongoDB Backend API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        setIsLoadingBackend(true);
        const [propsRes, projRes, devRes, leadsRes, visitsRes, bookingsRes, notifsRes] = await Promise.allSettled([
          api.getProperties({}, 1, 100),
          api.getProjects(),
          api.getDevelopers(),
          api.getLeads(),
          api.getSiteVisits(),
          api.getBookings(),
          api.getNotifications()
        ]);

        if (!isMounted) return;

        let connected = false;
        setDemoState(prev => {
          let updated = { ...prev };

          if (propsRes.status === 'fulfilled' && propsRes.value?.data && propsRes.value.data.length > 0) {
            connected = true;
            updated.properties = propsRes.value.data.map(p => ({
              ...p,
              id: (p as any).id || (p as any)._id || (p as any).referenceId
            }));
          }

          if (projRes.status === 'fulfilled' && Array.isArray(projRes.value) && projRes.value.length > 0) {
            connected = true;
            updated.projects = projRes.value.map(p => ({
              ...p,
              id: (p as any).id || (p as any)._id || (p as any).referenceId
            }));
          }

          if (devRes.status === 'fulfilled' && Array.isArray(devRes.value) && devRes.value.length > 0) {
            connected = true;
            updated.developers = devRes.value.map(d => ({
              ...d,
              id: (d as any).id || (d as any)._id || (d as any).referenceId
            }));
          }

          if (leadsRes.status === 'fulfilled' && Array.isArray(leadsRes.value) && leadsRes.value.length > 0) {
            connected = true;
            updated.leads = leadsRes.value.map(l => ({
              ...l,
              id: (l as any).id || (l as any)._id || (l as any).referenceId
            }));
          }

          if (visitsRes.status === 'fulfilled' && Array.isArray(visitsRes.value) && visitsRes.value.length > 0) {
            connected = true;
            updated.siteVisits = visitsRes.value.map(v => ({
              ...v,
              id: (v as any).id || (v as any)._id || (v as any).referenceId
            }));
          }

          if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value) && bookingsRes.value.length > 0) {
            connected = true;
            updated.bookings = bookingsRes.value.map(b => ({
              ...b,
              id: (b as any).id || (b as any)._id || (b as any).referenceId
            }));
          }

          if (notifsRes.status === 'fulfilled' && notifsRes.value?.notifications && notifsRes.value.notifications.length > 0) {
            connected = true;
            updated.notifications = notifsRes.value.notifications.map(n => ({
              ...n,
              id: (n as any).id || (n as any)._id || (n as any).referenceId
            }));
          }

          return connected ? updated : prev;
        });

        setIsBackendConnected(connected);
      } catch (err) {
        console.info('Backend API offline or initializing; utilizing client store.', err);
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    };

    fetchBackendData();
    return () => { isMounted = false; };
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState));
    } catch (e) {
      console.error('LocalStorage write error in DemoStateProvider', e);
    }
  }, [demoState]);

  // Synchronize across multiple browser tabs / windows in real time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEMO_STORAGE_KEY) {
        if (!e.newValue) {
          setDemoState(INITIAL_DEMO_STATE);
          return;
        }
        try {
          const freshData: DemoStateData = JSON.parse(e.newValue);
          if (freshData.version === INITIAL_DEMO_STATE.version) {
            setDemoState(freshData);
          }
        } catch (err) {
          console.warn('Error reading cross-tab storage change', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Selectors
  const getPropertyById = useCallback((id: string) => {
    return demoState.properties.find(p => p.id === id);
  }, [demoState.properties]);

  const getProjectById = useCallback((id: string) => {
    return demoState.projects.find(p => p.id === id);
  }, [demoState.projects]);

  const getDeveloperById = useCallback((id: string) => {
    return demoState.developers.find(d => d.id === id);
  }, [demoState.developers]);

  const getEmployeeById = useCallback((id: string) => {
    return demoState.employees.find(e => e.id === id);
  }, [demoState.employees]);

  const getCustomerById = useCallback((id: string) => {
    return demoState.customers.find(c => c.id === id);
  }, [demoState.customers]);

  const getLeadById = useCallback((id: string) => {
    return demoState.leads.find(l => l.id === id);
  }, [demoState.leads]);

  const getLeadsByStage = useCallback((stage: LeadStage) => {
    return demoState.leads.filter(l => l.stage === stage);
  }, [demoState.leads]);

  const getVisitsForLead = useCallback((leadId: string) => {
    return demoState.siteVisits.filter(v => v.leadId === leadId);
  }, [demoState.siteVisits]);

  const getVisitsForProperty = useCallback((propertyId: string) => {
    return demoState.siteVisits.filter(v => v.propertyId === propertyId);
  }, [demoState.siteVisits]);

  const getBookingsForProperty = useCallback((propertyId: string) => {
    return demoState.bookings.filter(b => b.propertyId === propertyId);
  }, [demoState.bookings]);

  const getActivitiesForEntity = useCallback((entityType: string, entityId: string) => {
    return demoState.activities.filter(a => a.entityType === entityType && a.entityId === entityId);
  }, [demoState.activities]);

  const getProjectProperties = useCallback((projectId: string) => {
    return demoState.properties.filter(p => p.projectId === projectId);
  }, [demoState.properties]);

  const savedProperties = useMemo(() => {
    return demoState.properties.filter(p => demoState.savedPropertyIds.includes(p.id));
  }, [demoState.properties, demoState.savedPropertyIds]);

  const comparedProperties = useMemo(() => {
    return demoState.properties.filter(p => demoState.comparedPropertyIds.includes(p.id));
  }, [demoState.properties, demoState.comparedPropertyIds]);

  const unreadNotificationCount = useMemo(() => {
    return demoState.notifications.filter(n => !n.read).length;
  }, [demoState.notifications]);

  // Actions
  const addProperty = useCallback((property: Property) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      properties: [property, ...prev.properties]
    }));
    api.createProperty(property).catch(e => console.warn('Backend sync warning for createProperty:', e));
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      properties: prev.properties.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    api.updateProperty(id, updates).catch(e => console.warn('Backend sync warning for updateProperty:', e));
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      properties: prev.properties.filter(p => p.id !== id),
      savedPropertyIds: prev.savedPropertyIds.filter(pid => pid !== id),
      comparedPropertyIds: prev.comparedPropertyIds.filter(pid => pid !== id)
    }));
    api.deleteProperty(id).catch(e => console.warn('Backend sync warning for deleteProperty:', e));
  }, []);

  const updatePropertyStatus = useCallback((id: string, status: ListingStatus) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      properties: prev.properties.map(p => p.id === id ? { ...p, status } : p)
    }));
    api.updatePropertyStatus(id, status).catch(e => console.warn('Backend sync warning for updatePropertyStatus:', e));
  }, []);

  const addActivity = useCallback((activityData: Omit<Activity, 'id' | 'timestamp'>): Activity => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...prev.activities]
    }));
    return newActivity;
  }, []);

  const addNotification = useCallback((notifData: Omit<DemoNotification, 'id' | 'timestamp' | 'read'>): DemoNotification => {
    const newNotif: DemoNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      notifications: [newNotif, ...prev.notifications]
    }));
    return newNotif;
  }, []);

  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    setDemoState(prev => {
      // Create associated activity
      const activity: Activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        entityType: 'lead',
        entityId: newLead.id,
        type: 'status-change',
        title: 'New Enquiry / Lead Registered',
        description: `Lead from ${newLead.buyerName} for ${newLead.propertyTitle}`,
        timestamp: now,
        performedBy: newLead.buyerName
      };

      // Create associated notification
      const notif: DemoNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: 'New Lead Inquired',
        message: `${newLead.buyerName} enquired about ${newLead.propertyTitle}`,
        type: 'lead',
        read: false,
        timestamp: now,
        actionView: 'seller-dashboard'
      };

      return {
        ...prev,
        lastUpdated: now,
        leads: [newLead, ...prev.leads],
        activities: [activity, ...prev.activities],
        notifications: [notif, ...prev.notifications]
      };
    });

    api.createLead(newLead).catch(e => console.warn('Backend sync warning for createLead:', e));
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      leads: prev.leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)
    }));
  }, []);

  const assignLead = useCallback((leadId: string, employeeId: string) => {
    setDemoState(prev => {
      const lead = prev.leads.find(l => l.id === leadId);
      const emp = prev.employees.find(e => e.id === employeeId);
      if (!lead) return prev;

      const activity: Activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        entityType: 'lead',
        entityId: leadId,
        type: 'status-change',
        title: 'Lead Reassigned',
        description: `Assigned to ${emp ? emp.name : employeeId}`,
        timestamp: new Date().toISOString(),
        performedBy: 'CRM Administrator'
      };

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        leads: prev.leads.map(l => l.id === leadId ? { ...l, assignedEmployeeId: employeeId, updatedAt: new Date().toISOString() } : l),
        activities: [activity, ...prev.activities]
      };
    });
    api.assignLead(leadId, employeeId).catch(e => console.warn('Backend sync warning for assignLead:', e));
  }, []);

  const updateLeadStage = useCallback((leadId: string, stage: LeadStage) => {
    setDemoState(prev => {
      const lead = prev.leads.find(l => l.id === leadId);
      if (!lead) return prev;

      const activity: Activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        entityType: 'lead',
        entityId: leadId,
        type: 'status-change',
        title: `Stage Updated: ${stage.toUpperCase()}`,
        description: `Lead moved from '${lead.stage}' to '${stage}'`,
        timestamp: new Date().toISOString(),
        performedBy: 'Sales Representative'
      };

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        leads: prev.leads.map(l => l.id === leadId ? { ...l, stage, updatedAt: new Date().toISOString() } : l),
        activities: [activity, ...prev.activities]
      };
    });
    api.updateLeadStage(leadId, stage).catch(e => console.warn('Backend sync warning for updateLeadStage:', e));
  }, []);

  const scheduleSiteVisit = useCallback((visitData: Omit<SiteVisit, 'id'>): SiteVisit => {
    const newVisit: SiteVisit = {
      ...visitData,
      id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };

    setDemoState(prev => {
      const activity: Activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        entityType: 'site-visit',
        entityId: newVisit.id,
        type: 'site-visit',
        title: 'Site Visit Scheduled',
        description: `Inspection for ${newVisit.customerName} on ${newVisit.date} (${newVisit.timeSlot})`,
        timestamp: new Date().toISOString(),
        performedBy: newVisit.customerName
      };

      const notif: DemoNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: 'Site Visit Booked',
        message: `${newVisit.customerName} scheduled a visit for ${newVisit.propertyTitle}`,
        type: 'visit',
        read: false,
        timestamp: new Date().toISOString(),
        actionView: 'seller-dashboard'
      };

      // Also ensure lead stage reflects scheduled visit if lead exists
      const updatedLeads = prev.leads.map(l => {
        if (l.id === newVisit.leadId && l.stage === 'new') {
          return { ...l, stage: 'scheduled' as LeadStage, scheduledVisitDate: newVisit.date, updatedAt: new Date().toISOString() };
        }
        return l;
      });

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        siteVisits: [newVisit, ...prev.siteVisits],
        leads: updatedLeads,
        activities: [activity, ...prev.activities],
        notifications: [notif, ...prev.notifications]
      };
    });

    api.scheduleSiteVisit(newVisit).catch(e => console.warn('Backend sync warning for scheduleSiteVisit:', e));
    return newVisit;
  }, []);

  const updateSiteVisit = useCallback((id: string, updates: Partial<SiteVisit>) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      siteVisits: prev.siteVisits.map(v => v.id === id ? { ...v, ...updates } : v)
    }));
    api.updateSiteVisit(id, updates).catch(e => console.warn('Backend sync warning for updateSiteVisit:', e));
  }, []);

  const createBooking = useCallback((bookingData: Omit<Booking, 'id' | 'bookingNumber'>): Booking => {
    const bookingNumber = `GG-BKG-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookingNumber
    };

    setDemoState(prev => {
      const activity: Activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        entityType: 'booking',
        entityId: newBooking.id,
        type: 'token',
        title: 'New Booking & Token Received',
        description: `Booking #${newBooking.bookingNumber} created with token ₹${newBooking.tokenAmount.toLocaleString('en-IN')}`,
        timestamp: new Date().toISOString(),
        performedBy: 'Accounts & Legal Desk'
      };

      const notif: DemoNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: 'Booking Created',
        message: `Booking #${newBooking.bookingNumber} registered for ${newBooking.propertyTitle}`,
        type: 'booking',
        read: false,
        timestamp: new Date().toISOString(),
        actionView: 'seller-dashboard'
      };

      // Set property to under-negotiation or sold
      const updatedProperties = prev.properties.map(p => {
        if (p.id === newBooking.propertyId) {
          return { ...p, status: 'under-negotiation' as ListingStatus };
        }
        return p;
      });

      // Update lead if connected
      const updatedLeads = prev.leads.map(l => {
        if (l.id === newBooking.leadId) {
          return { ...l, stage: 'won' as LeadStage, updatedAt: new Date().toISOString() };
        }
        return l;
      });

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        bookings: [newBooking, ...prev.bookings],
        properties: updatedProperties,
        leads: updatedLeads,
        activities: [activity, ...prev.activities],
        notifications: [notif, ...prev.notifications]
      };
    });

    api.createBooking(newBooking).catch(e => console.warn('Backend sync warning for createBooking:', e));
    return newBooking;
  }, []);

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setDemoState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      bookings: prev.bookings.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
    api.updateBooking(id, updates).catch(e => console.warn('Backend sync warning for updateBooking:', e));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setDemoState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
    api.markNotificationRead(id).catch(e => console.warn('Backend sync warning for markNotificationRead:', e));
  }, []);

  const toggleSaveProperty = useCallback((id: string) => {
    setDemoState(prev => {
      const exists = prev.savedPropertyIds.includes(id);
      return {
        ...prev,
        savedPropertyIds: exists
          ? prev.savedPropertyIds.filter(pid => pid !== id)
          : [...prev.savedPropertyIds, id]
      };
    });
    api.toggleFavorite(id).catch(e => console.warn('Backend sync warning for toggleFavorite:', e));
  }, []);

  const toggleCompareProperty = useCallback((id: string) => {
    setDemoState(prev => {
      const exists = prev.comparedPropertyIds.includes(id);
      if (exists) {
        return {
          ...prev,
          comparedPropertyIds: prev.comparedPropertyIds.filter(pid => pid !== id)
        };
      }
      if (prev.comparedPropertyIds.length >= 4) {
        return prev; // Maximum 4 for side-by-side comparison
      }
      return {
        ...prev,
        comparedPropertyIds: [...prev.comparedPropertyIds, id]
      };
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setDemoState(prev => ({ ...prev, savedPropertyIds: [] }));
  }, []);

  const clearComparison = useCallback(() => {
    setDemoState(prev => ({ ...prev, comparedPropertyIds: [] }));
  }, []);

  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem('gg_properties');
      localStorage.removeItem('gg_saved_ids');
      localStorage.removeItem('gg_compared_ids');
      localStorage.removeItem('gg_enquiries');
    } catch (e) {
      console.warn('LocalStorage cleanup warning', e);
    }
    setDemoState({
      ...INITIAL_DEMO_STATE,
      lastUpdated: new Date().toISOString()
    });
  }, []);

  const contextValue = useMemo<DemoStateContextType>(() => ({
    properties: demoState.properties,
    developers: demoState.developers,
    projects: demoState.projects,
    employees: demoState.employees,
    customers: demoState.customers,
    leads: demoState.leads,
    siteVisits: demoState.siteVisits,
    bookings: demoState.bookings,
    activities: demoState.activities,
    notifications: demoState.notifications,
    savedPropertyIds: demoState.savedPropertyIds,
    comparedPropertyIds: demoState.comparedPropertyIds,

    isBackendConnected,
    isLoadingBackend,

    savedProperties,
    comparedProperties,
    unreadNotificationCount,

    getPropertyById,
    getProjectById,
    getDeveloperById,
    getEmployeeById,
    getCustomerById,
    getLeadById,
    getLeadsByStage,
    getVisitsForLead,
    getVisitsForProperty,
    getBookingsForProperty,
    getActivitiesForEntity,
    getProjectProperties,

    addProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,

    addLead,
    updateLead,
    assignLead,
    updateLeadStage,

    scheduleSiteVisit,
    updateSiteVisit,

    createBooking,
    updateBooking,

    addActivity,
    markNotificationRead,
    addNotification,

    toggleSaveProperty,
    toggleCompareProperty,
    clearFavorites,
    clearComparison,

    resetDemoData
  }), [
    demoState,
    savedProperties,
    comparedProperties,
    unreadNotificationCount,
    getPropertyById,
    getProjectById,
    getDeveloperById,
    getEmployeeById,
    getCustomerById,
    getLeadById,
    getLeadsByStage,
    getVisitsForLead,
    getVisitsForProperty,
    getBookingsForProperty,
    getActivitiesForEntity,
    getProjectProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    addLead,
    updateLead,
    assignLead,
    updateLeadStage,
    scheduleSiteVisit,
    updateSiteVisit,
    createBooking,
    updateBooking,
    addActivity,
    markNotificationRead,
    addNotification,
    toggleSaveProperty,
    toggleCompareProperty,
    clearFavorites,
    clearComparison,
    resetDemoData,
    isBackendConnected,
    isLoadingBackend
  ]);

  return (
    <DemoStateContext.Provider value={contextValue}>
      {children}
    </DemoStateContext.Provider>
  );
};

export const useDemoState = (): DemoStateContextType => {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error('useDemoState must be used within a DemoStateProvider');
  }
  return context;
};
