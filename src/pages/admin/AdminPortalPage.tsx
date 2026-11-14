import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { AdminLayout } from '../../components/admin/AdminLayout';
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
import { AdminAccessDeniedPage } from './AdminAccessDeniedPage';
import { api } from '../../services/api';
import { AdminUser } from '../../types/crm';
import { LanguageCode } from '../../types/property';
import { CrmModule, hasModuleAccess, isStaffRole } from '../../utils/rbac';

interface AdminPortalPageProps {
  initialModule?: CrmModule;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onNavigate: (view: string, params?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  initialModule = 'dashboard',
  lang,
  onLanguageChange,
  onNavigate,
  onShowToast,
}) => {
  const [currentModule, setCurrentModule] = useState<CrmModule>(initialModule);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentModule(initialModule);
  }, [initialModule]);

  // Verify staff session on mount
  useEffect(() => {
    const verifyStaffSession = async () => {
      setIsLoadingAuth(true);
      const token = api.getToken();
      if (!token) {
        onNavigate('admin-login');
        return;
      }

      try {
        const user = await api.getProfile();
        if (!user || !isStaffRole(user.role)) {
          setAuthError('Access Denied: Current authenticated user does not have staff privileges.');
          setIsLoadingAuth(false);
          return;
        }
        setCurrentUser(user as AdminUser);
      } catch (err: any) {
        console.warn('Session verification error:', err);
        // Do NOT silently fall back to mock identity in production admin
        onNavigate('admin-login');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    verifyStaffSession();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    if (onShowToast) onShowToast('You have been securely signed out of the Admin CRM.', 'info');
    onNavigate('admin-login');
  };

  if (isLoadingAuth) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F2E9' }}>
        <CircularProgress size={44} sx={{ color: '#013E18' }} />
      </Box>
    );
  }

  if (authError || !currentUser) {
    return (
      <AdminAccessDeniedPage
        lang={lang}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        requiredRole="Staff Administrator"
      />
    );
  }

  // Check module permission
  if (!hasModuleAccess(currentUser.role, currentModule)) {
    return (
      <AdminAccessDeniedPage
        lang={lang}
        onNavigate={(view) => {
          if (view === 'home') onNavigate('home');
          else setCurrentModule('dashboard');
        }}
        onLogout={handleLogout}
        requiredRole={`Authorized access for ${currentModule}`}
      />
    );
  }

  return (
    <AdminLayout
      currentUser={currentUser}
      currentModule={currentModule}
      lang={lang}
      onLanguageChange={onLanguageChange}
      onNavigateModule={(mod) => {
        setCurrentModule(mod);
        onNavigate(`admin-${mod}`);
      }}
      onLogout={handleLogout}
      onNavigatePublic={() => onNavigate('home')}
    >
      {currentModule === 'dashboard' && (
        <AdminDashboardModule
          currentUser={currentUser}
          lang={lang}
          onNavigateModule={(mod) => {
            setCurrentModule(mod);
            onNavigate(`admin-${mod}`);
          }}
        />
      )}

      {currentModule === 'leads' && (
        <AdminLeadsModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'customers' && (
        <AdminCustomersModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'properties' && (
        <AdminPropertiesModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'projects' && (
        <AdminProjectsModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'site-visits' && (
        <AdminSiteVisitsModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'bookings' && (
        <AdminBookingsModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'tasks' && (
        <AdminTasksModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'team' && (
        <AdminTeamModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'reports' && (
        <AdminReportsModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'audit-log' && (
        <AdminAuditLogModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'settings' && (
        <AdminSettingsModule currentUser={currentUser} lang={lang} />
      )}

      {currentModule === 'masters' && (
        <AdminMastersModule lang={lang} onShowToast={onShowToast} />
      )}

      {currentModule === 'content' && (
        <AdminContentModule lang={lang} onShowToast={onShowToast} />
      )}
    </AdminLayout>
  );
};

