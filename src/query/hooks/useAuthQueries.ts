import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { api } from '../../services/api';
import { clearSensitiveCachesOnLogout } from '../queryClient';
import { useAppDispatch } from '../../store/hooks';
import { resetClientStateOnLogout } from '../../store/slices/uiSlice';
import { addToast } from '../../store/slices/toastSlice';
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
  canReadAdminContent,
  canModifyContent,
  canReadAdminMasters,
  canModifyMasters,
  canReadAdminProperties,
  canPublishProperties,
  canReadSellerProperties,
  canReadLeads,
  canReadBookings,
  canReadSiteVisits,
  canReadSettings,
  canModifySettings,
  CrmModule,
} from '../../utils/rbac';
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  mapFirebaseError,
  type FirebaseUser,
} from '../../config/firebase';

let isInitialized = false;
let currentFbUser: FirebaseUser | null = null;
const listeners = new Set<(user: FirebaseUser | null) => void>();

if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    const prevFbUser = currentFbUser;
    isInitialized = true;
    currentFbUser = user;
    if (user) {
      try {
        const token = await user.getIdToken();
        api.setToken(token);
      } catch {}
    } else if (prevFbUser) {
      api.setToken(null);
    }
    listeners.forEach((listener) => listener(user));
  });
}

export type AuthInitState = 'loading' | 'unauthenticated' | 'profile-loading' | 'ready' | 'failed';

export const useCurrentUser = () => {
  const queryClient = useQueryClient();
  const [init, setInit] = useState(isInitialized);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(currentFbUser);

  useEffect(() => {
    const handleAuthChange = (user: FirebaseUser | null) => {
      setInit(true);
      setFbUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    };

    if (isInitialized) {
      setInit(true);
      setFbUser(currentFbUser);
    }

    listeners.add(handleAuthChange);
    return () => {
      listeners.delete(handleAuthChange);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      if (!auth.currentUser && !api.getToken()) {
        return null;
      }
      try {
        const res = await api.getProfile();
        const profile = res?.user || res || null;
        if (profile && auth.currentUser) {
          return {
            ...profile,
            emailVerified: Boolean(auth.currentUser.emailVerified || profile.emailVerified),
            firebaseUid: auth.currentUser.uid,
          };
        }
        return profile;
      } catch (err: any) {
        if (err?.status === 401 || err?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: init,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const authState: AuthInitState = useMemo(() => {
    if (!init) return 'loading';
    if (!fbUser && !api.getToken()) return 'unauthenticated';
    if (query.isLoading) return 'profile-loading';
    if (query.isError) return 'failed';
    return 'ready';
  }, [init, fbUser, query.isLoading, query.isError]);

  const user = query.data || null;
  const authReady = init;
  const profileReady = authState === 'ready' || authState === 'unauthenticated';
  const accountActive = user?.accountStatus === 'active';
  const isStaff = isStaffRole(user?.role);
  const isSeller = user?.role === 'seller';
  const isBuyer = user?.role === 'buyer';

  const canAccessModule = useCallback(
    (mod: CrmModule): boolean => {
      return canViewModule(user?.role, mod);
    },
    [user?.role]
  );

  const canPerform = useCallback(
    (mod: CrmModule, action: 'create' | 'read' | 'update' | 'delete' | 'assign' | 'publish'): boolean => {
      return canPerformAction(user?.role, mod, action);
    },
    [user?.role]
  );

  return {
    ...query,
    isLoading: !init || query.isLoading,
    firebaseUser: fbUser,
    user,
    authState,
    authReady,
    profileReady,
    accountActive,
    isStaff,
    isSeller,
    isBuyer,
    canAccessModule,
    canPerform,
    // Exact Endpoint Permission Predicates
    canReadCustomers: canReadCustomers(user?.role),
    canReadTasks: canReadTasks(user?.role),
    canReadTeam: canReadTeam(user?.role),
    canManageTeam: canManageTeam(user?.role),
    canReadReports: canReadReports(user?.role),
    canReadAuditLogs: canReadAuditLogs(user?.role),
    canReadAdminContent: canReadAdminContent(user?.role),
    canModifyContent: canModifyContent(user?.role),
    canReadAdminMasters: canReadAdminMasters(user?.role),
    canModifyMasters: canModifyMasters(user?.role),
    canReadAdminProperties: canReadAdminProperties(user?.role),
    canPublishProperties: canPublishProperties(user?.role),
    canReadSellerProperties: canReadSellerProperties(user?.role),
    canReadLeads: canReadLeads(user?.role),
    canReadBookings: canReadBookings(user?.role),
    canReadSiteVisits: canReadSiteVisits(user?.role),
    canReadSettings: canReadSettings(user?.role),
    canModifySettings: canModifySettings(user?.role),
  };
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        const userCred = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        const token = await userCred.user.getIdToken();
        api.setToken(token);
        const res = await api.getProfile();
        return {
          user: res?.user || res,
          firebaseUser: userCred.user,
        };
      } catch (err: any) {
        // Fallback check for legacy non-migrated users
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const legacyRes = await api.login(credentials);
            return legacyRes;
          } catch {
            throw new Error(mapFirebaseError(err));
          }
        }
        throw new Error(mapFirebaseError(err));
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      dispatch(
        addToast({
          type: 'success',
          message: `Welcome back, ${data.user?.fullName || data.user?.name || 'User'}!`,
        })
      );
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (payload: any) => {
      try {
        // 1. Create account in Firebase
        const userCred = await createUserWithEmailAndPassword(auth, payload.email, payload.password);

        // 2. Send Firebase verification email
        try {
          await sendEmailVerification(userCred.user);
        } catch (mailErr) {
          console.warn('[Firebase] Verification email send warning:', mailErr);
        }

        // 3. Obtain Firebase ID token
        const token = await userCred.user.getIdToken();
        api.setToken(token);

        // 4. Onboard in MongoDB
        const res = await api.onboarding({
          fullName: payload.fullName,
          mobile: payload.mobile,
          accountUsage: payload.accountUsage || (payload.role === 'seller' ? 'seller' : 'buyer'),
          role: payload.role || 'buyer',
          address: {
            district: payload.district,
            city: payload.city,
            locality: payload.locality,
          },
          sellerDetails: payload.sellerType
            ? {
                sellerType: payload.sellerType,
                companyName: payload.companyName,
                reraNumber: payload.reraNumber,
                licenseNumber: payload.licenseNumber,
                preferredContactMethod: payload.preferredContactMethod || 'phone',
              }
            : undefined,
          consents: {
            termsAccepted: true,
            termsPolicyVersion: '2026.1',
            marketingConsent: Boolean(payload.marketingConsent),
          },
        });

        return {
          user: res.user,
          firebaseUser: userCred.user,
        };
      } catch (err: any) {
        throw new Error(mapFirebaseError(err));
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      dispatch(
        addToast({
          type: 'success',
          message: 'Account registered! A verification link has been sent to your email.',
        })
      );
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      try {
        await signOut(auth);
      } catch {}
      await api.logout();
    },
    onSettled: () => {
      api.setToken(null);
      clearSensitiveCachesOnLogout();
      dispatch(resetClientStateOnLogout());
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      dispatch(
        addToast({
          type: 'info',
          message: 'You have been logged out securely.',
        })
      );
    },
  });
};

export const useSyncVerification = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const freshToken = await auth.currentUser.getIdToken(true);
        api.setToken(freshToken);
      }
      return api.syncVerification();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      if (data.emailVerified) {
        dispatch(
          addToast({
            type: 'success',
            message: 'Email verification confirmed! Welcome to Grounds & Gates.',
          })
        );
      } else {
        dispatch(
          addToast({
            type: 'info',
            message: 'Email has not been verified yet. Please check your inbox and click the verification link.',
          })
        );
      }
    },
  });
};
