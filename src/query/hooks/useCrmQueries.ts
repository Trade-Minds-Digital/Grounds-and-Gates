import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { api } from '../../services/api';
import { Lead, SiteVisit, Booking, LeadStage } from '../../types/demo';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/toastSlice';
import { useCurrentUser } from './useAuthQueries';
import {
  isStaffRole,
  canViewModule,
  canPerformAction,
  canReadCustomers,
  canReadTasks,
  canReadTeam,
  canManageTeam,
  canReadReports,
  canReadAuditLogs,
  canReadLeads,
  canReadBookings,
  canReadSiteVisits,
} from '../../utils/rbac';

export interface CrmQueryOptions {
  enabled?: boolean;
}

// ─── Leads ──────────────────────────────────────────
export const useLeads = (filters: Record<string, any> = {}, options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadLeads } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadLeads;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.leads.list(filters, userScope),
    queryFn: async ({ signal }) => {
      const res = await api.getLeads(filters, { signal });
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useLead = (id: string | undefined, options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadLeads } = useCurrentUser();
  const isEligible = Boolean(id) && authReady && profileReady && accountActive && canReadLeads;
  const enabled = Boolean(id) && (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.leads.detail(id || '', userScope),
    queryFn: async ({ signal }) => {
      if (!id) return null;
      return api.getLeadById(id, { signal });
    },
    enabled,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      if (user && !canReadLeads(user.role)) {
        throw new Error('Access denied. Insufficient permissions to create leads.');
      }
      return api.createLead(lead);
    },
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Lead for ${newLead.buyerName} created successfully.`,
        })
      );
    },
  });
};

export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user, canReadLeads } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: LeadStage }) => {
      if (!canReadLeads) {
        throw new Error('Access denied. You do not have permission to update leads.');
      }
      return api.updateLeadStage(id, stage);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Lead stage updated to ${updated.stage}.`,
        })
      );
    },
  });
};

export const useMergeLeads = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ primaryId, secondaryId }: { primaryId: string; secondaryId: string }) => {
      const allowed = ['super-admin', 'admin', 'sales-manager'].includes(user?.role || '');
      if (!allowed) {
        throw new Error('Access denied. Administrator or Sales Manager role required to merge leads.');
      }
      return api.mergeLeads(primaryId, secondaryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Leads merged successfully.',
        })
      );
    },
  });
};

// ─── Bookings ───────────────────────────────────────
export const useBookings = (options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadBookings } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadBookings;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.bookings.list(userScope),
    queryFn: async ({ signal }) => {
      const res = await api.getBookings({}, { signal });
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (bookingData: Partial<Booking>) => {
      const allowed = ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'seller'].includes(user?.role || '');
      if (!allowed) {
        throw new Error('Access denied. Insufficient permissions to create a booking.');
      }
      return api.createBooking(bookingData);
    },
    onSuccess: (bkg) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Booking #${bkg.bookingNumber || bkg.id} recorded.`,
        })
      );
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Booking> }) => {
      const allowed = ['super-admin', 'admin', 'sales-manager'].includes(user?.role || '');
      if (!allowed) {
        throw new Error('Access denied. Administrator or Sales Manager role required to update bookings.');
      }
      return api.updateBooking(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Booking details updated.',
        })
      );
    },
  });
};

// ─── Site Visits ────────────────────────────────────
export const useSiteVisits = (options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadSiteVisits } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadSiteVisits;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.siteVisits.list(userScope),
    queryFn: async ({ signal }) => {
      const res = await api.getSiteVisits({}, { signal });
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useCreateSiteVisit = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (visitData: Partial<SiteVisit>) => {
      const allowed = ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'buyer'].includes(user?.role || '');
      if (!allowed) {
        throw new Error('Access denied. Insufficient permissions to schedule a site visit.');
      }
      return api.createSiteVisit(visitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteVisits.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Site visit scheduled.',
        })
      );
    },
  });
};

export const useUpdateSiteVisit = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SiteVisit> }) => {
      const allowed = ['super-admin', 'admin', 'sales-manager', 'sales-executive'].includes(user?.role || '');
      if (!allowed) {
        throw new Error('Access denied. Insufficient permissions to update site visit.');
      }
      return api.updateSiteVisit(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteVisits.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Site visit updated.',
        })
      );
    },
  });
};

// ─── Tasks ──────────────────────────────────────────
export const useTasks = (filters: Record<string, any> = {}, options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadTasks } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadTasks;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.tasks.list(filters, userScope),
    queryFn: async ({ signal }) => {
      const res = await api.getTasks(filters, { signal });
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (taskData: any) => {
      if (!canReadTasks(user?.role)) {
        throw new Error('Access denied. Staff role required to create tasks.');
      }
      return api.createTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Task assigned successfully.',
        })
      );
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!canReadTasks(user?.role)) {
        throw new Error('Access denied. Staff role required to update tasks.');
      }
      return api.updateTask(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Task updated.',
        })
      );
    },
  });
};

// ─── Team / Staff ───────────────────────────────────
export const useTeam = (options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadTeam } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadTeam;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.team.list(userScope),
    queryFn: async ({ signal }) => {
      return api.getStaffUsers({ signal });
    },
    enabled,
    staleTime: 60 * 1000,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (payload: { fullName: string; email: string; password: string; mobile: string; role: string }) => {
      if (!canManageTeam(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to add staff.');
      }
      return api.createStaffUser(payload);
    },
    onSuccess: (staff: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Staff member ${staff.fullName || staff.email} added.`,
        })
      );
    },
  });
};

export const useDeactivateStaff = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!canManageTeam(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to change staff status.');
      }
      return api.updateStaffStatus(id, isActive ? 'active' : 'inactive');
    },
    onSuccess: (updated: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
      dispatch(
        addToast({
          type: 'info',
          message: `Account status updated to ${updated?.isActive ? 'Active' : 'Deactivated'}.`,
        })
      );
    },
  });
};

export const useReassignWorkload = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ fromUserId, toUserId }: { fromUserId: string; toUserId: string }) => {
      if (!canManageTeam(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to reassign staff records.');
      }
      return api.reassignStaffRecords(fromUserId, toUserId);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.siteVisits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Reassigned ${data?.reassignedLeads || 0} leads and active records.`,
        })
      );
    },
  });
};

// ─── Customers, Developers, Projects ─────────────────
export const useCustomers = (options: CrmQueryOptions = {}) => {
  const { user, authReady, profileReady, accountActive, canReadCustomers } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadCustomers;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.customers.list(userScope),
    queryFn: async ({ signal }) => {
      const res = await api.getCustomers({ signal });
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled,
    staleTime: 60 * 1000,
  });
};

export const useDevelopers = (options: CrmQueryOptions = {}) => {
  return useQuery({
    queryKey: queryKeys.developers.list(),
    queryFn: async () => {
      const res = await api.getDevelopers();
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjects = (options: CrmQueryOptions = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: async () => {
      const res = await api.getProjects();
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
};

// ─── Reports & Audit Logs ───────────────────────────
export const useReportsSummary = (options: CrmQueryOptions = {}) => {
  const { authReady, profileReady, accountActive, canReadReports } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadReports;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.reports.summary(),
    queryFn: async ({ signal }) => {
      return api.getReportsSummary({ signal });
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useAuditLogs = (filters: Record<string, any> = {}, options: CrmQueryOptions = {}) => {
  const { authReady, profileReady, accountActive, canReadAuditLogs } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && canReadAuditLogs;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: async ({ signal }) => {
      const res = await api.getAuditLogs(filters, { signal });
      return Array.isArray(res) ? res : ((res as any)?.items || (res as any)?.data || []);
    },
    enabled,
    staleTime: 20 * 1000,
  });
};
