import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../query/hooks/useAuthQueries';
import { PageLoader } from '../common/PageLoader';
import { isStaffRole } from '../../utils/rbac';

interface RequireAdminProps {
  children?: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { user, isLoading, isError, authReady, profileReady, isStaff, accountActive } = useCurrentUser();
  const location = useLocation();

  if (isLoading || !authReady || !profileReady) {
    return <PageLoader />;
  }

  // Not logged in or query failed -> redirect to admin login
  if (!user || isError) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?returnUrl=${returnUrl}`} replace />;
  }

  // Check if staff and active
  if (!isStaff || !accountActive) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
