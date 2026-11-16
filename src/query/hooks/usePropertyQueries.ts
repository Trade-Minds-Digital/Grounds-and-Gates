import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { api } from '../../services/api';
import { Property, PropertyFilterState, MapMarkerItem } from '../../types/property';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/toastSlice';
import { useCurrentUser } from './useAuthQueries';
import {
  canReadAdminProperties,
  canReadSellerProperties,
  canPublishProperties,
} from '../../utils/rbac';

export const useProperties = (filters: Partial<PropertyFilterState> = {}) => {
  return useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: async () => {
      const res = await api.getProperties(filters);
      return Array.isArray(res) ? res : res.data || [];
    },
    staleTime: 60 * 1000,
  });
};

export const useMapMarkers = (filters: Partial<PropertyFilterState> = {}) => {
  return useQuery<MapMarkerItem[]>({
    queryKey: queryKeys.properties.mapMarkers(filters),
    queryFn: async () => {
      return api.getMapMarkers(filters);
    },
    staleTime: 60 * 1000,
  });
};

export const useProperty = (idOrSlug: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.properties.detail(idOrSlug || ''),
    queryFn: async () => {
      if (!idOrSlug) return null;
      return api.getPropertyByIdOrSlug(idOrSlug);
    },
    enabled: Boolean(idOrSlug),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSellerProperty = (idOrSlug: string | undefined) => {
  const { user, authReady, profileReady, accountActive, canReadSellerProperties: hasSellerAccess, canReadAdminProperties: hasAdminAccess } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && (hasSellerAccess || hasAdminAccess);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.properties.sellerDetail(idOrSlug || '', userScope),
    queryFn: async () => {
      if (!idOrSlug) return null;
      return api.getSellerProperty(idOrSlug);
    },
    enabled: Boolean(idOrSlug) && Boolean(isEligible),
    staleTime: 30 * 1000,
  });
};

export const useSellerProperties = (options: { enabled?: boolean } = {}) => {
  const { user, authReady, profileReady, accountActive, canReadSellerProperties: hasSellerAccess } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && hasSellerAccess;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);
  const userScope = user?._id || user?.id || 'anon';

  return useQuery({
    queryKey: queryKeys.properties.sellerMine(userScope),
    queryFn: async () => {
      return api.getMySellerProperties();
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useAdminProperty = (idOrSlug: string | undefined, options: { enabled?: boolean } = {}) => {
  const { authReady, profileReady, accountActive, canReadAdminProperties: hasAdminAccess } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && hasAdminAccess;
  const enabled = Boolean(idOrSlug) && (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.properties.adminDetail(idOrSlug || ''),
    queryFn: async () => {
      if (!idOrSlug) return null;
      return api.getAdminProperty(idOrSlug);
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useAdminProperties = (filters: Record<string, any> = {}, options: { enabled?: boolean } = {}) => {
  const { authReady, profileReady, accountActive, canReadAdminProperties: hasAdminAccess } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && hasAdminAccess;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.properties.adminList(filters),
    queryFn: async () => {
      return api.getAdminProperties(filters);
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useUpdatePropertyPublishStatus = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({
      id,
      publishingStatus,
      rejectionReason,
      notes,
    }: {
      id: string;
      publishingStatus: 'published' | 'pending-review' | 'draft' | 'rejected' | 'archived';
      rejectionReason?: string;
      notes?: string;
    }) => {
      if (!canPublishProperties(user?.role)) {
        throw new Error('Access denied. Administrator or Listing Manager role required to update publication status.');
      }
      return api.updatePropertyPublishStatus(id, publishingStatus, rejectionReason, notes);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.setQueryData(queryKeys.properties.detail(updated.id), updated);
      if (updated.slug) {
        queryClient.setQueryData(queryKeys.properties.detail(updated.slug), updated);
      }
      queryClient.setQueryData(queryKeys.properties.sellerDetail(updated.id), updated);
      if (updated.slug) {
        queryClient.setQueryData(queryKeys.properties.sellerDetail(updated.slug), updated);
      }
      dispatch(
        addToast({
          type: 'success',
          message: `Property publication status updated to "${updated.publishingStatus}".`,
        })
      );
    },
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (propertyData: Partial<Property>) => {
      const allowed = ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'developer', 'seller'].includes(user?.role || '');
      if (user && !allowed) {
        throw new Error('Access denied. Insufficient permissions to list a property.');
      }
      return api.createProperty(propertyData);
    },
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Property '${newProperty.title}' listed successfully!`,
        })
      );
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const allowed = ['super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'developer', 'seller'].includes(user?.role || '');
      if (user && !allowed) {
        throw new Error('Access denied. Insufficient permissions to modify this property.');
      }
      return api.updateProperty(id, updates);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.setQueryData(queryKeys.properties.detail(updated.id), updated);
      if (updated.slug) {
        queryClient.setQueryData(queryKeys.properties.detail(updated.slug), updated);
      }
      dispatch(
        addToast({
          type: 'success',
          message: 'Property updated successfully.',
        })
      );
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (id: string) => {
      if (user?.role !== 'super-admin' && user?.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required to delete properties.');
      }
      return api.deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Property listing removed.',
        })
      );
    },
  });
};
