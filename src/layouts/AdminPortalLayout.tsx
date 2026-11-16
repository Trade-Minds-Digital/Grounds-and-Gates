import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ToastContainer } from '../components/common/ToastContainer';
import { useCurrentUser, useLogout } from '../query/hooks/useAuthQueries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguage } from '../store/slices/uiSlice';
import { CrmModule } from '../utils/rbac';
import { AdminUser } from '../types/crm';
import { LanguageCode } from '../types/property';

export const AdminPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);

  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  // Determine current active module from path
  const currentModule: CrmModule = useMemo(() => {
    const clean = location.pathname.replace(/^\/Grounds-and-Gates/, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'admin') {
      const mod = parts[1];
      if (
        [
          'dashboard',
          'leads',
          'customers',
          'properties',
          'projects',
          'site-visits',
          'bookings',
          'tasks',
          'team',
          'reports',
          'masters',
          'content',
          'settings',
          'audit-logs',
        ].includes(mod)
      ) {
        return mod as CrmModule;
      }
    }
    return 'dashboard';
  }, [location.pathname]);

  const adminUser: AdminUser = useMemo(() => {
    return {
      id: user?.id || user?._id || '',
      fullName: user?.fullName || user?.name || 'Administrator',
      email: user?.email || '',
      mobile: user?.phone || user?.mobile || '',
      role: (user?.role as any) || 'sales-executive',
      accountStatus: user?.accountStatus || 'active',
      isActive: user?.accountStatus === 'active',
      lastLogin: new Date().toISOString(),
    };
  }, [user]);

  const handleNavigateModule = (mod: CrmModule) => {
    navigate(`/admin/${mod}`);
  };

  const handleNavigatePublic = () => {
    navigate('/');
  };

  const handleLanguageChange = (l: LanguageCode) => {
    dispatch(setLanguage(l));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/admin/login');
  };

  return (
    <>
      <AdminLayout
        currentUser={adminUser}
        currentModule={currentModule}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onNavigateModule={handleNavigateModule}
        onLogout={handleLogout}
        onNavigatePublic={handleNavigatePublic}
      >
        <Outlet />
      </AdminLayout>
      <ToastContainer />
    </>
  );
};
