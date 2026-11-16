import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../services/apiClient';
import { store } from '../store';
import { addToast } from '../store/slices/toastSlice';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default stale time
      gcTime: 10 * 60 * 1000, // 10 minutes cache garbage collection
      refetchOnWindowFocus: false, // Prevent jarring refetches
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          // Never retry authorization, validation, or resource-not-found errors
          if ([400, 401, 403, 404, 409, 422].includes(error.status)) {
            return false;
          }
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        const msg = error instanceof ApiError ? error.message : (error instanceof Error ? error.message : 'Operation failed');
        store.dispatch(
          addToast({
            type: 'error',
            message: msg,
          })
        );
      },
    },
  },
});

export const clearSensitiveCachesOnLogout = () => {
  // Cancel any active in-flight queries
  queryClient.cancelQueries();

  // Clear sensitive user and CRM queries
  queryClient.removeQueries({ queryKey: ['auth'] });
  queryClient.removeQueries({ queryKey: ['leads'] });
  queryClient.removeQueries({ queryKey: ['bookings'] });
  queryClient.removeQueries({ queryKey: ['siteVisits'] });
  queryClient.removeQueries({ queryKey: ['tasks'] });
  queryClient.removeQueries({ queryKey: ['customers'] });
  queryClient.removeQueries({ queryKey: ['team'] });
  queryClient.removeQueries({ queryKey: ['auditLogs'] });
  queryClient.removeQueries({ queryKey: ['reports'] });
  queryClient.removeQueries({ queryKey: ['settings'] });
  queryClient.removeQueries({ queryKey: ['properties', 'seller'] });
  queryClient.removeQueries({ queryKey: ['properties', 'admin'] });
};

