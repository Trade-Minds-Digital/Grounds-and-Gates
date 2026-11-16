import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { api } from '../../services/api';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/toastSlice';
import { useCurrentUser } from './useAuthQueries';
import { canReadAdminContent, canModifyContent } from '../../utils/rbac';

export const usePublicContent = () => {
  return useQuery({
    queryKey: queryKeys.content.publicAll(),
    queryFn: async () => {
      return api.getPublicContent();
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useAllContent = (options: { enabled?: boolean } = {}) => {
  const { authReady, profileReady, accountActive, canReadAdminContent: hasPermission } = useCurrentUser();
  const isEligible = authReady && profileReady && accountActive && hasPermission;
  const enabled = (options.enabled ?? true) && Boolean(isEligible);

  return useQuery({
    queryKey: queryKeys.content.adminAll(),
    queryFn: async () => {
      return api.getContentSections();
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSaveContentDraft = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ section, payload }: { section: string; payload: any }) => {
      if (!canModifyContent(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to edit content drafts.');
      }
      return api.saveContentDraft(section, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.adminAll() });
      dispatch(
        addToast({
          type: 'success',
          message: `Draft changes for '${variables.section}' saved.`,
        })
      );
    },
  });
};

export const usePublishContent = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (section: string) => {
      if (!canModifyContent(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to publish content.');
      }
      return api.publishContent(section);
    },
    onSuccess: (_, section) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Section '${section}' is now live on the public website!`,
        })
      );
    },
  });
};

export const useDiscardContentDraft = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (section: string) => {
      if (!canModifyContent(user?.role)) {
        throw new Error('Access denied. Administrator privileges required to discard content drafts.');
      }
      return api.discardContentDraft(section);
    },
    onSuccess: (_, section) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.adminAll() });
      dispatch(
        addToast({
          type: 'info',
          message: `Draft changes for '${section}' discarded.`,
        })
      );
    },
  });
};
