import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../query/hooks/useAuthQueries';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast } from '../../store/slices/toastSlice';
import { AdminUser } from '../../types/crm';
import { CrmModule, canViewModule } from '../../utils/rbac';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { AdminDashboardModule } from './modules/AdminDashboardModule';
import { AdminLeadsModule } from './modules/AdminLeadsModule';
import { AdminCustomersModule } from './modules/AdminCustomersModule';
import { AdminPropertiesModule } from './modules/AdminPropertiesModule';
import { AdminProjectsModule } from './modules/AdminProjectsModule';
import { AdminSiteVisitsModule } from './modules/AdminSiteVisitsModule';
import { AdminBookingsModule } from './modules/AdminBookingsModule';
import { AdminTasksModule } from './modules/AdminTasksModule';
import { AdminTeamModule } from './modules/AdminTeamModule';
import { AdminReportsModule } from './modules/AdminReportsModule';
import { AdminAuditLogModule } from './modules/AdminAuditLogModule';
import { AdminSettingsModule } from './modules/AdminSettingsModule';
import { AdminMastersModule } from './modules/AdminMastersModule';
import { AdminContentModule } from './modules/AdminContentModule';

interface AdminModuleWrapperProps {
  module: CrmModule;
}

export const AdminModuleWrapper: React.FC<AdminModuleWrapperProps> = ({ module }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const { user, isLoading, authReady, profileReady } = useCurrentUser();
  const params = useParams();

  const adminUser: AdminUser = useMemo(() => {
    return {
      id: user?.id || user?._id || '',
      fullName: user?.fullName || user?.name || 'Administrator',
      email: user?.email || '',
      mobile: user?.phone || user?.mobile || '',
      role: (user?.role as any) || 'buyer',
      accountStatus: user?.accountStatus || 'active',
      isActive: user?.accountStatus === 'active',
      lastLogin: new Date().toISOString(),
    };
  }, [user]);

  const handleShowToast = (message: string, type: 'success' | 'info' | 'error') => {
    dispatch(addToast({ message, type }));
  };

  const handleNavigateModule = (mod: CrmModule) => {
    navigate(`/admin/${mod}`);
  };

  // Wait for verified authorization before dispatching any queries or rendering protected UI
  if (isLoading || !authReady || !profileReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#013E18' }} />
      </Box>
    );
  }

  // Route permission gate: block unauthorized module views before rendering and API execution
  if (!user || !canViewModule(user.role, module)) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', backgroundColor: '#FAF8F2', borderRadius: '16px', m: 3, border: '1px solid #E5E0D8' }}>
        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', mb: 2 }}>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
          Access Denied: {(module || 'MODULE').toUpperCase()}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, maxWidth: 440, mx: 'auto' }}>
          Your role ({user?.role || 'Guest'}) does not have permission to access the {module} CRM module.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/dashboard')}
          sx={{ mt: 3, backgroundColor: '#013E18', color: '#FAF8F2', textTransform: 'none', fontWeight: 700 }}
        >
          Return to Dashboard
        </Button>
      </Box>
    );
  }

  switch (module) {
    case 'dashboard':
      return <AdminDashboardModule currentUser={adminUser} lang={lang} onNavigateModule={handleNavigateModule} />;
    case 'leads':
      return <AdminLeadsModule currentUser={adminUser} lang={lang} />;
    case 'customers':
      return <AdminCustomersModule currentUser={adminUser} lang={lang} />;
    case 'properties':
      return <AdminPropertiesModule currentUser={adminUser} lang={lang} />;
    case 'projects':
      return <AdminProjectsModule currentUser={adminUser} lang={lang} />;
    case 'site-visits':
      return <AdminSiteVisitsModule currentUser={adminUser} lang={lang} />;
    case 'bookings':
      return <AdminBookingsModule currentUser={adminUser} lang={lang} />;
    case 'tasks':
      return <AdminTasksModule currentUser={adminUser} lang={lang} />;
    case 'team':
      return <AdminTeamModule currentUser={adminUser} lang={lang} />;
    case 'reports':
      return <AdminReportsModule currentUser={adminUser} lang={lang} />;
    case 'masters':
      return <AdminMastersModule lang={lang} onShowToast={handleShowToast} />;
    case 'content':
      return <AdminContentModule lang={lang} onShowToast={handleShowToast} />;
    case 'settings':
      return <AdminSettingsModule currentUser={adminUser} lang={lang} />;
    case 'audit-log':
      return <AdminAuditLogModule currentUser={adminUser} lang={lang} />;
    default:
      return <AdminDashboardModule currentUser={adminUser} lang={lang} onNavigateModule={handleNavigateModule} />;
  }
};
