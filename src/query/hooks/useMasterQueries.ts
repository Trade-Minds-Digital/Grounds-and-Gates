import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { api } from '../../services/api';
import { MasterItem } from '../../types/masters';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/toastSlice';
import { useCurrentUser } from './useAuthQueries';
import { canReadAdminMasters, canModifyMasters } from '../../utils/rbac';

export const usePublicMasters = () => {
  return useQuery({
    queryKey: queryKeys.masters.publicBatch(['all']),
    queryFn: async () => {
      return api.getPublicMastersBatch();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache for public masters
  });
};

export const useMasterType = (type: string, query: Record<string, any> = {}, options: { enabled?: boolean } = {}) => {
  const { authReady, profileReady, accountActive, canReadAdminMasters: hasPermission } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && hasPermission;
  const enabled = Boolean(type) && (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.masters.type(type, query),
    queryFn: async () => {
      const res = await api.getMasters({ type, ...query });
      return res;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMasterUsage = (type: string, id: string | null, options: { enabled?: boolean } = {}) => {
  const { authReady, profileReady, accountActive, canReadAdminMasters: hasPermission } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && hasPermission;
  const enabled = Boolean(id) && (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.masters.usage(type, id || ''),
    queryFn: async () => {
      if (!id) return null;
      return api.getMasterUsage(type, id);
    },
    enabled,
  });
};

export const useSaveMaster = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ type, id, payload }: { type: string; id?: string; payload: Partial<MasterItem> }) => {
      if (!canModifyMasters(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to create or modify masters.');
      }
      if (id) {
        return api.updateMaster(type, id, payload);
      }
      return api.createMaster(type, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masters.all });
      // Invalidate property and form queries if a master like category or district changes
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Master record ${variables.id ? 'updated' : 'created'} successfully.`,
        })
      );
    },
  });
};

export const useToggleMasterStatus = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ type, id, isActive }: { type: string; id: string; isActive: boolean }) => {
      if (!canModifyMasters(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to change master status.');
      }
      return api.toggleMasterStatus(type, id, isActive);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masters.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Status updated to ${updated.isActive ? 'Active' : 'Inactive'}.`,
        })
      );
    },
  });
};

export const useDeleteMaster = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      if (!canModifyMasters(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to delete master records.');
      }
      return api.deleteMaster(type, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masters.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Master item deleted successfully.',
        })
      );
    },
  });
};
