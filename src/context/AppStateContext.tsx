/**
 * Grounds & Gates - Production Application State Context
 * Replaces legacy DemoStateContext with real-time API-driven state management.
 * Connects directly to Express + MongoDB REST APIs.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Property, ListingStatus } from '../types/property';
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
} from '../types/demo';
import { api } from '../services/api';
import { MasterItem } from '../types/masters';

export interface UserProfile {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AppStateContextType {
  // Master API Datasets
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

  // User & Auth State
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  userRole: string;

  // Saved & Compared Listings
  savedPropertyIds: string[];
  comparedPropertyIds: string[];
  savedProperties: Property[];
  comparedProperties: Property[];
  unreadNotificationCount: number;

  // Loading & Error States
  isLoadingProperties: boolean;
  propertiesError: string | null;
  isBackendConnected: boolean;

  // Centralized Masters & Content
  masters: Record<string, MasterItem[]>;
  webContent: Record<string, any>;
  refreshMasters: () => Promise<void>;
  refreshWebContent: () => Promise<void>;

  // Refresh & Sync Actions
  refreshProperties: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Auth Actions
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (data: { fullName: string; email: string; password: string; mobile?: string; role?: string }) => Promise<any>;
  logout: () => Promise<void>;

  // Property Actions
  addProperty: (property: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  updatePropertyStatus: (id: string, status: ListingStatus) => Promise<Property>;
  getPropertyById: (id: string) => Property | undefined;

  // Favorites & Comparison Actions
  toggleSaveProperty: (id: string) => Promise<void>;
  toggleCompareProperty: (id: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  clearComparison: () => Promise<void>;

  // CRM Actions
  addLead: (leadData: Partial<Lead>) => Promise<Lead>;
  updateLeadStage: (leadId: string, stage: LeadStage) => Promise<Lead>;
  assignLead: (leadId: string, employeeId: string) => Promise<Lead>;
  scheduleSiteVisit: (visitData: Partial<SiteVisit>) => Promise<SiteVisit>;
  createBooking: (bookingData: Partial<Booking>) => Promise<Booking>;
  submitEnquiry: (data: any) => Promise<any>;

  // Backward compatibility alias (no-op in production)
  resetDemoData: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<DemoNotification[]>([]);
  const [masters, setMasters] = useState<Record<string, MasterItem[]>>({});
  const [webContent, setWebContent] = useState<Record<string, any>>({});

  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Saved properties & comparisons
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gg_guest_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gg_guest_compared');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Verify authentication profile on mount
  const checkAuthProfile = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setCurrentUser(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      if (profile) {
        setCurrentUser({
          id: profile._id || profile.id,
          name: profile.fullName || profile.name || 'User',
          fullName: profile.fullName || profile.name || 'User',
          email: profile.email,
          role: profile.role || 'buyer',
          phone: profile.mobile || profile.phone,
        });
        setIsLoggedIn(true);

        // Sync authenticated user's favorites from API
        try {
          const favs = await api.getFavorites();
          if (favs && Array.isArray(favs.propertyIds)) {
            setSavedPropertyIds(favs.propertyIds);
          }
        } catch {}

        // Sync authenticated user's comparisons from API
        try {
          const comp = await api.getComparison();
          if (comp && Array.isArray(comp.propertyIds)) {
            setComparedPropertyIds(comp.propertyIds);
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Session verification failed, cleared token:', err);
      api.setToken(null);
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  // Fetch live properties from MongoDB
  const fetchProperties = useCallback(async () => {
    setIsLoadingProperties(true);
    setPropertiesError(null);
    try {
      const response = await api.getProperties({}, 1, 100);
      const propsList = Array.isArray(response) ? response : response.data || [];
      // Map MongoDB referenceId or _id to standard frontend id
      const normalizedProps = propsList.map((p: any) => ({
        ...p,
        id: p.referenceId || p._id || p.id,
      }));
      setProperties(normalizedProps);
      setIsBackendConnected(true);
    } catch (err: any) {
      console.error('Failed to fetch properties from API:', err);
      setPropertiesError(err.message || 'Unable to connect to property listings server.');
      setIsBackendConnected(false);
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  // Fetch ancillary datasets if authenticated
  const fetchAncillaryData = useCallback(async () => {
    try {
      const [projs, devs] = await Promise.all([
        api.getProjects().catch(() => []),
        api.getDevelopers().catch(() => []),
      ]);
      setProjects(projs);
      setDevelopers(devs);
    } catch {}

    // CRM datasets (if authenticated as staff)
    if (api.getToken()) {
      try {
        const [empList, custList, leadList, visitList, bkgList] = await Promise.all([
          api.getEmployees().catch(() => []),
          api.getCustomers().catch(() => []),
          api.getLeads().catch(() => []),
          api.getSiteVisits().catch(() => []),
          api.getBookings().catch(() => []),
        ]);
        setEmployees(empList);
        setCustomers(custList);
        setLeads(leadList);
        setSiteVisits(visitList);
        setBookings(bkgList);
      } catch {}
    }
  }, []);

  const fetchMasters = useCallback(async () => {
    try {
      const batch = await api.getPublicMastersBatch();
      if (batch && typeof batch === 'object') {
        setMasters(batch);
      }
    } catch (err) {
      console.warn('Failed to load masters batch from backend API:', err);
    }
  }, []);

  const fetchWebContent = useCallback(async () => {
    try {
      const content = await api.getPublicContent();
      if (content && typeof content === 'object') {
        setWebContent(content);
      }
    } catch (err) {
      console.warn('Failed to load published web content from backend API:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchProperties(), fetchAncillaryData(), checkAuthProfile(), fetchMasters(), fetchWebContent()]);
  }, [fetchProperties, fetchAncillaryData, checkAuthProfile, fetchMasters, fetchWebContent]);

  useEffect(() => {
    checkAuthProfile();
    fetchProperties();
    fetchAncillaryData();
    fetchMasters();
    fetchWebContent();
  }, [checkAuthProfile, fetchProperties, fetchAncillaryData, fetchMasters, fetchWebContent]);

  // Derived Saved & Compared Properties
  const savedProperties = useMemo(() => {
    return properties.filter((p) => savedPropertyIds.includes(p.id));
  }, [properties, savedPropertyIds]);

  const comparedProperties = useMemo(() => {
    return properties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [properties, comparedPropertyIds]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Query Selectors
  const getPropertyById = useCallback(
    (id: string) => {
      return properties.find((p) => p.id === id || p.slug === id);
    },
    [properties]
  );

  // Authentication Handlers
  const handleLogin = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    await checkAuthProfile();
    await fetchAncillaryData();
    return res;
  };

  const handleRegister = async (data: { fullName: string; email: string; password: string; mobile?: string; role?: string }) => {
    const res = await api.register(data);
    await checkAuthProfile();
    return res;
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setCurrentUser(null);
    setIsLoggedIn(false);
    setSavedPropertyIds([]);
    setComparedPropertyIds([]);
    localStorage.removeItem('gg_guest_saved');
    localStorage.removeItem('gg_guest_compared');
  };

  // Property Actions
  const handleAddProperty = async (propData: Partial<Property>): Promise<Property> => {
    const created = await api.createProperty(propData);
    await fetchProperties();
    return created;
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
    const updated = await api.updateProperty(id, updates);
    await fetchProperties();
    return updated;
  };

  const handleDeleteProperty = async (id: string): Promise<void> => {
    await api.deleteProperty(id);
    await fetchProperties();
  };

  const handleUpdatePropertyStatus = async (id: string, status: ListingStatus): Promise<Property> => {
    const updated = await api.updatePropertyStatus(id, status);
    await fetchProperties();
    return updated;
  };

  // Favorites Handler
  const handleToggleSaveProperty = async (id: string) => {
    const isSaved = savedPropertyIds.includes(id);
    const updatedIds = isSaved ? savedPropertyIds.filter((pId) => pId !== id) : [...savedPropertyIds, id];
    setSavedPropertyIds(updatedIds);

    if (isLoggedIn) {
      try {
        await api.toggleFavorite(id);
      } catch (err) {
        console.warn('Failed to sync favorite to server:', err);
      }
    } else {
      try {
        localStorage.setItem('gg_guest_saved', JSON.stringify(updatedIds));
      } catch {}
    }
  };

  // Compare Handler
  const handleToggleCompareProperty = async (id: string) => {
    const isCompared = comparedPropertyIds.includes(id);
    let updatedIds: string[];
    if (isCompared) {
      updatedIds = comparedPropertyIds.filter((pId) => pId !== id);
    } else {
      if (comparedPropertyIds.length >= 4) {
        throw new Error('Maximum 4 properties can be compared simultaneously.');
      }
      updatedIds = [...comparedPropertyIds, id];
    }
    setComparedPropertyIds(updatedIds);

    if (isLoggedIn) {
      try {
        await api.updateComparison(updatedIds);
      } catch (err) {
        console.warn('Failed to sync comparison to server:', err);
      }
    } else {
      try {
        localStorage.setItem('gg_guest_compared', JSON.stringify(updatedIds));
      } catch {}
    }
  };

  const handleClearFavorites = async () => {
    setSavedPropertyIds([]);
    localStorage.removeItem('gg_guest_saved');
  };

  const handleClearComparison = async () => {
    setComparedPropertyIds([]);
    localStorage.removeItem('gg_guest_compared');
    if (isLoggedIn) {
      try {
        await api.updateComparison([]);
      } catch {}
    }
  };

  // CRM Actions
  const handleAddLead = async (leadData: Partial<Lead>): Promise<Lead> => {
    const created = await api.createLead(leadData);
    setLeads((prev) => [created, ...prev]);
    return created;
  };

  const handleUpdateLeadStage = async (leadId: string, stage: LeadStage): Promise<Lead> => {
    const updated = await api.updateLeadStage(leadId, stage);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    return updated;
  };

  const handleAssignLead = async (leadId: string, employeeId: string): Promise<Lead> => {
    const updated = await api.assignLead(leadId, employeeId);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    return updated;
  };

  const handleScheduleSiteVisit = async (visitData: Partial<SiteVisit>): Promise<SiteVisit> => {
    const created = await api.scheduleSiteVisit(visitData);
    setSiteVisits((prev) => [created, ...prev]);
    return created;
  };

  const handleCreateBooking = async (bookingData: Partial<Booking>): Promise<Booking> => {
    const created = await api.createBooking(bookingData);
    setBookings((prev) => [created, ...prev]);
    await fetchProperties();
    return created;
  };

  const handleSubmitEnquiry = async (data: any) => {
    const res = await api.createEnquiry(data);
    await fetchAncillaryData();
    return res;
  };

  // Reversible, safe no-op for backward compatibility
  const resetDemoData = () => {
    console.info('resetDemoData called: In production API mode, sample state reset is disabled.');
  };

  const contextValue = useMemo<AppStateContextType>(
    () => ({
      properties,
      developers,
      projects,
      employees,
      customers,
      leads,
      siteVisits,
      bookings,
      activities,
      notifications,
      currentUser,
      isLoggedIn,
      userRole: currentUser?.role || 'buyer',
      savedPropertyIds,
      comparedPropertyIds,
      savedProperties,
      comparedProperties,
      unreadNotificationCount,
      isLoadingProperties,
      propertiesError,
      isBackendConnected,
      masters,
      webContent,
      refreshMasters: fetchMasters,
      refreshWebContent: fetchWebContent,
      refreshProperties: fetchProperties,
      refreshAll,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      addProperty: handleAddProperty,
      updateProperty: handleUpdateProperty,
      deleteProperty: handleDeleteProperty,
      updatePropertyStatus: handleUpdatePropertyStatus,
      getPropertyById,
      toggleSaveProperty: handleToggleSaveProperty,
      toggleCompareProperty: handleToggleCompareProperty,
      clearFavorites: handleClearFavorites,
      clearComparison: handleClearComparison,
      addLead: handleAddLead,
      updateLeadStage: handleUpdateLeadStage,
      assignLead: handleAssignLead,
      scheduleSiteVisit: handleScheduleSiteVisit,
      createBooking: handleCreateBooking,
      submitEnquiry: handleSubmitEnquiry,
      resetDemoData,
    }),
    [
      properties,
      developers,
      projects,
      employees,
      customers,
      leads,
      siteVisits,
      bookings,
      activities,
      notifications,
      currentUser,
      isLoggedIn,
      savedPropertyIds,
      comparedPropertyIds,
      savedProperties,
      comparedProperties,
      unreadNotificationCount,
      isLoadingProperties,
      propertiesError,
      isBackendConnected,
      fetchProperties,
      refreshAll,
      getPropertyById,
      masters,
      webContent,
      fetchMasters,
      fetchWebContent,
    ]
  );

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Also export useDemoState alias for seamless backward compatibility during transition
export const useDemoState = useAppState;
export const DemoStateProvider = AppStateProvider;

