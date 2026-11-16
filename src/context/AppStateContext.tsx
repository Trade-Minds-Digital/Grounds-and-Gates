/**
 * Grounds & Gates - Unified Application State Bridge
 * Connects TanStack React Query and Redux Toolkit to legacy context consumers.
 * Eliminates redundant useEffect fetching and competing client caches.
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';
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
import { MasterItem } from '../types/masters';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query/queryKeys';
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
} from '../query/hooks/usePropertyQueries';
import { usePublicMasters } from '../query/hooks/useMasterQueries';
import { usePublicContent } from '../query/hooks/useContentQueries';
import { useCurrentUser, useLogin, useRegister, useLogout } from '../query/hooks/useAuthQueries';
import {
  useLeads,
  useCreateLead,
  useUpdateLeadStage,
  useBookings,
  useCreateBooking,
  useSiteVisits,
  useCreateSiteVisit,
  useCustomers,
  useProjects,
  useDevelopers,
  useTeam,
} from '../query/hooks/useCrmQueries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  toggleSaveProperty as toggleSaveRedux,
  clearSavedProperties as clearSavedRedux,
  toggleCompareProperty as toggleCompareRedux,
  clearComparedProperties as clearComparedRedux,
} from '../store/slices/uiSlice';
import { api } from '../services/api';

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
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  // Redux Client UI State
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  // TanStack React Query Hooks for Server State
  const { data: properties = [], isLoading: isLoadingProperties, error: propertiesQueryError } = useProperties();
  const { data: masters = {} } = usePublicMasters();
  const { data: webContent = {} } = usePublicContent();
  const {
    user: authUser,
    authReady,
    profileReady,
    accountActive,
    isStaff,
    isSeller,
    canReadCustomers,
    canReadTeam,
    canReadLeads,
    canReadBookings,
    canReadSiteVisits,
  } = useCurrentUser();
  
  // Scoped queries: ONLY enabled if the user has the required permission
  const { data: leads = [] } = useLeads({}, { enabled: Boolean(authUser && accountActive && canReadLeads) });
  const { data: bookings = [] } = useBookings({ enabled: Boolean(authUser && accountActive && canReadBookings) });
  const { data: siteVisits = [] } = useSiteVisits({ enabled: Boolean(authUser && accountActive && canReadSiteVisits) });
  const { data: customers = [] } = useCustomers({ enabled: Boolean(authUser && accountActive && canReadCustomers) });
  const { data: projects = [] } = useProjects();
  const { data: developers = [] } = useDevelopers();
  const { data: team = [] } = useTeam({ enabled: Boolean(authUser && accountActive && canReadTeam) });

  // Mutations
  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const createLeadMutation = useCreateLead();
  const updateLeadStageMutation = useUpdateLeadStage();
  const createBookingMutation = useCreateBooking();
  const createSiteVisitMutation = useCreateSiteVisit();

  const currentUser: UserProfile | null = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser._id || authUser.id,
      name: authUser.fullName || authUser.name || 'User',
      fullName: authUser.fullName || authUser.name || 'User',
      email: authUser.email,
      role: authUser.role || 'buyer',
      phone: authUser.mobile || authUser.phone,
    };
  }, [authUser]);

  const savedProperties = useMemo(() => {
    return properties.filter((p) => savedPropertyIds.includes(p.id));
  }, [properties, savedPropertyIds]);

  const comparedProperties = useMemo(() => {
    return properties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [properties, comparedPropertyIds]);

  const refreshProperties = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
  }, [queryClient]);

  const refreshMasters = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.masters.all });
  }, [queryClient]);

  const refreshWebContent = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
  }, [queryClient]);

  const refreshAll = useCallback(async () => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.masters.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all }),
    ];
    if (canReadLeads) {
      invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }));
    }
    if (authUser && accountActive) {
      if (canReadBookings) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }));
      }
      if (canReadSiteVisits) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.siteVisits.all }));
      }
      if (canReadCustomers) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }));
      }
      if (canReadTeam) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.team.all }));
      }
    }
    await Promise.all(invalidations);
  }, [queryClient, canReadLeads, canReadBookings, canReadSiteVisits, canReadCustomers, canReadTeam, authUser, accountActive]);

  const value: AppStateContextType = {
    properties,
    developers,
    projects,
    employees: team,
    customers,
    leads,
    siteVisits,
    bookings,
    activities: [],
    notifications: [],

    currentUser,
    isLoggedIn: Boolean(currentUser),
    userRole: currentUser?.role || 'buyer',

    savedPropertyIds,
    comparedPropertyIds,
    savedProperties,
    comparedProperties,
    unreadNotificationCount: 0,

    isLoadingProperties,
    propertiesError: propertiesQueryError ? (propertiesQueryError as Error).message : null,
    isBackendConnected: true,

    masters: masters as Record<string, MasterItem[]>,
    webContent: webContent as Record<string, any>,
    refreshMasters,
    refreshWebContent,

    refreshProperties,
    refreshAll,

    login: async (credentials) => loginMutation.mutateAsync(credentials),
    register: async (payload) => registerMutation.mutateAsync(payload),
    logout: async () => logoutMutation.mutateAsync(),

    addProperty: async (prop) => createPropertyMutation.mutateAsync(prop),
    updateProperty: async (id, updates) => updatePropertyMutation.mutateAsync({ id, updates }),
    deleteProperty: async (id) => deletePropertyMutation.mutateAsync(id),
    updatePropertyStatus: async (id, status) => {
      const updated = await api.updatePropertyStatus(id, status);
      await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      return updated;
    },
    getPropertyById: (id: string) => properties.find((p) => p.id === id || p.slug === id),

    toggleSaveProperty: async (id: string) => {
      dispatch(toggleSaveRedux(id));
      if (currentUser) {
        try {
          await api.toggleFavorite(id);
        } catch {}
      }
    },
    toggleCompareProperty: async (id: string) => {
      dispatch(toggleCompareRedux(id));
      if (currentUser) {
        try {
          await api.updateComparison([...comparedPropertyIds, id]);
        } catch {}
      }
    },
    clearFavorites: async () => {
      dispatch(clearSavedRedux());
    },
    clearComparison: async () => {
      dispatch(clearComparedRedux());
    },

    addLead: async (lead) => createLeadMutation.mutateAsync(lead),
    updateLeadStage: async (id, stage) => updateLeadStageMutation.mutateAsync({ id, stage }),
    assignLead: async (id, employeeId) => {
      const updated = await api.assignLead(id, employeeId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      return updated;
    },
    scheduleSiteVisit: async (visit) => createSiteVisitMutation.mutateAsync(visit),
    createBooking: async (bkg) => createBookingMutation.mutateAsync(bkg),
    submitEnquiry: async (enquiry) => api.createEnquiry(enquiry),

    resetDemoData: () => {},
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export const useDemoState = useAppState;
