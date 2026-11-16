import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from '../pages/admin/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from '../pages/admin/AdminResetPasswordPage';
import { AdminAccessDeniedPage } from '../pages/admin/AdminAccessDeniedPage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast } from '../store/slices/toastSlice';
import { useLogout } from '../query/hooks/useAuthQueries';

export const AdminLoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const lang = useAppSelector((state) => state.ui.language);

  const returnUrl = searchParams.get('returnUrl') || '/admin/dashboard';

  return (
    <AdminLoginPage
      lang={lang}
      onLoginSuccess={() => {
        dispatch(addToast({ type: 'success', message: 'Admin authentication verified.' }));
        navigate(returnUrl);
      }}
      onNavigate={(view) => {
        if (view === 'admin-forgot-password') {
          navigate('/admin/forgot-password');
        } else if (view === 'admin-dashboard') {
          navigate('/admin/dashboard');
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
    />
  );
};

export const AdminForgotPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const lang = useAppSelector((state) => state.ui.language);

  return (
    <AdminForgotPasswordPage
      lang={lang}
      onNavigate={(view, params) => {
        if (view === 'admin-login') {
          navigate('/admin/login');
        } else if (view === 'admin-reset-password') {
          const qs = params?.token ? `?token=${encodeURIComponent(params.token)}` : '';
          navigate(`/admin/reset-password${qs}`);
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
    />
  );
};

export const AdminResetPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = useAppSelector((state) => state.ui.language);
  const token = searchParams.get('token') || '';

  return (
    <AdminResetPasswordPage
      lang={lang}
      initialToken={token}
      onNavigate={(view) => {
        if (view === 'admin-login') {
          navigate('/admin/login');
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
    />
  );
};

export const AdminAccessDeniedRoute: React.FC = () => {
  const navigate = useNavigate();
  const lang = useAppSelector((state) => state.ui.language);
  const logoutMutation = useLogout();

  return (
    <AdminAccessDeniedPage
      lang={lang}
      onNavigate={(view) => {
        if (view === 'admin-login') {
          navigate('/admin/login');
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
      onLogout={() => {
        logoutMutation.mutate();
        navigate('/admin/login');
      }}
    />
  );
};

