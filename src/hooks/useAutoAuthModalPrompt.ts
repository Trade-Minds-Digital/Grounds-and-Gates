import { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCurrentUser } from '../query/hooks/useAuthQueries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { openAuthModal } from '../store/slices/uiSlice';

const AUTO_PROMPT_STORAGE_KEY = 'gg_auth_modal_auto_shown';

/**
 * Automatically triggers the authentication modal 5 seconds after a logged-out
 * visitor enters a public page. Enforces:
 * - Runs only once per browser tab session via sessionStorage
 * - Never runs for authenticated users
 * - Waits until Firebase authentication has verified the visitor's state
 * - Defers if active dialogs (enquiry modal, etc.) are open
 * - Does not trigger on admin, verification, action, or auth callback routes
 * - Cancels gracefully on login, manual modal trigger, or unmount
 */
export const useAutoAuthModalPrompt = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { data: user, authReady, isLoading } = useCurrentUser();
  const activeAuthModal = useAppSelector((state) => state.ui.activeAuthModal);
  const activeEnquiryModal = useAppSelector((state) => state.ui.activeEnquiryModal);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  // Routes strictly excluded from automatic popup
  const isExcludedRoute = useMemo(() => {
    const p = location.pathname.toLowerCase();
    return (
      p.startsWith('/admin') ||
      p.startsWith('/auth/action') ||
      p.startsWith('/verify-email') ||
      p.startsWith('/reset-password') ||
      p.startsWith('/login') ||
      p.startsWith('/register') ||
      p.startsWith('/forgot-password')
    );
  }, [location.pathname]);

  useEffect(() => {
    // 1. Wait for Firebase Auth initialization to finish
    if (isLoading || !authReady) return;

    // 2. If visitor is already authenticated, cancel timer and mark shown
    if (user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      try {
        sessionStorage.setItem(AUTO_PROMPT_STORAGE_KEY, 'true');
      } catch {}
      return;
    }

    // 3. Check sessionStorage: show at most once per tab session
    try {
      const alreadyShown = sessionStorage.getItem(AUTO_PROMPT_STORAGE_KEY);
      if (alreadyShown === 'true') {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
    } catch {}

    // 4. If user manually opened auth modal, cancel pending timer and mark as shown
    if (activeAuthModal.isOpen) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      try {
        sessionStorage.setItem(AUTO_PROMPT_STORAGE_KEY, 'true');
      } catch {}
      return;
    }

    // 5. Excluded routes (admin, password-reset, email action links)
    if (isExcludedRoute) {
      return;
    }

    // 6. Avoid interrupting an active dialog (e.g. Enquiry modal)
    if (activeEnquiryModal.isOpen) {
      return;
    }

    // 7. Start the 5-second countdown timer once
    if (!hasStartedRef.current && !timerRef.current) {
      hasStartedRef.current = true;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;

        // Verify conditions one last time before popping up
        try {
          const already = sessionStorage.getItem(AUTO_PROMPT_STORAGE_KEY);
          if (already === 'true') return;
          sessionStorage.setItem(AUTO_PROMPT_STORAGE_KEY, 'true');
        } catch {}

        const currentPath = window.location.pathname.toLowerCase();
        if (
          currentPath.includes('/admin') ||
          currentPath.includes('/auth/action') ||
          currentPath.includes('/verify-email') ||
          currentPath.includes('/reset-password')
        ) {
          return;
        }

        dispatch(
          openAuthModal({
            mode: 'login',
            trigger: 'auto-5s',
            contextMessage: 'Sign in to unlock verified land documents, direct seller contacts, and shortlist sync.',
          })
        );
      }, 5000);
    }
  }, [
    authReady,
    isLoading,
    user,
    isExcludedRoute,
    activeAuthModal.isOpen,
    activeEnquiryModal.isOpen,
    dispatch,
  ]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
};

