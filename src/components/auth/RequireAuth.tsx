import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../query/hooks/useAuthQueries';
import { PageLoader } from '../common/PageLoader';
import { useAppDispatch } from '../../store/hooks';
import { openAuthModal } from '../../store/slices/uiSlice';
import { getSafeRedirectPath } from '../../utils/navigationUtils';

interface RequireAuthProps {
  children?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const destination = getSafeRedirectPath(location.pathname + location.search);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        dispatch(
          openAuthModal({
            mode: 'login',
            redirectPath: destination,
            trigger: 'protected-route',
            contextMessage: 'Sign in to access your dashboard, shortlist, and post properties.',
          })
        );
      } else if (!user.emailVerified) {
        dispatch(
          openAuthModal({
            mode: 'verify-email',
            redirectPath: destination,
            emailForVerification: user.email,
            trigger: 'protected-route',
            contextMessage: 'Please verify your email address to access this protected area.',
          })
        );
      }
    }
  }, [isLoading, user, destination, dispatch]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user || !user.emailVerified) {
    // Return safely to a public page without entering a redirect loop
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
