import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AccountLayout } from '../layouts/AccountLayout';
import { AdminPortalLayout } from '../layouts/AdminPortalLayout';
import { RouteErrorBoundary } from '../components/common/RouteErrorBoundary';
import { NotFoundPage } from '../components/common/NotFoundPage';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { RequireAuth } from '../components/auth/RequireAuth';
import { RequireAdmin } from '../components/auth/RequireAdmin';

// Public Screen Routes
import {
  HomePageRoute,
  PropertiesPageRoute,
  PropertyDetailsRoute,
  ComparePageRoute,
  FavoritesPageRoute,
  PostPropertyPageRoute,
  AboutPageRoute,
  ContactPageRoute,
  AuthPageRoute,
  VerifyEmailPageRoute,
  AuthActionPageRoute,
  ProfilePageRoute,
  SellerPropertyPreviewRoute,
} from './PublicRoutes';

// Account Screen Routes
import { BuyerDashboardRoute, SellerDashboardRoute } from './AccountRoutes';

// Admin Auth Routes
import {
  AdminLoginRoute,
  AdminForgotPasswordRoute,
  AdminResetPasswordRoute,
  AdminAccessDeniedRoute,
} from './AdminAuthRoutes';

// Admin Module Routes
import { AdminModuleWrapper } from '../pages/admin/AdminModuleWrapper';

export const getRouterBasename = (): string => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Grounds-and-Gates')) {
    return '/Grounds-and-Gates';
  }
  return '';
};

export const AppRouter: React.FC = () => {
  const basename = getRouterBasename();

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <RouteErrorBoundary>
        <Routes>
          {/* ─── PUBLIC WEBSITE & BUYER FLOWS ──────────────── */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePageRoute />} />
            <Route path="properties" element={<PropertiesPageRoute />} />
            <Route path="properties/:slug" element={<PropertyDetailsRoute />} />
            <Route path="property/:slug" element={<PropertyDetailsRoute />} />
            <Route path="compare" element={<ComparePageRoute />} />
            <Route path="favorites" element={<FavoritesPageRoute />} />
            <Route path="about" element={<AboutPageRoute />} />
            <Route path="contact" element={<ContactPageRoute />} />
            <Route path="login" element={<AuthPageRoute initialTab="login" />} />
            <Route path="register" element={<AuthPageRoute initialTab="register" />} />
            <Route path="forgot-password" element={<AuthPageRoute initialTab="forgot-password" />} />
            <Route path="verify-email" element={<VerifyEmailPageRoute />} />
            <Route path="auth/action" element={<AuthActionPageRoute />} />
            <Route path="reset-password" element={<AuthActionPageRoute />} />

            {/* Authenticated Post & Edit Property Wizard */}
            <Route
              path="post-property"
              element={
                <RequireAuth>
                  <PostPropertyPageRoute />
                </RequireAuth>
              }
            />
            <Route
              path="edit-property/:idOrSlug"
              element={
                <RequireAuth>
                  <PostPropertyPageRoute isEditMode />
                </RequireAuth>
              }
            />
            <Route
              path="seller/preview/:idOrSlug"
              element={
                <RequireAuth>
                  <SellerPropertyPreviewRoute />
                </RequireAuth>
              }
            />
            <Route
              path="properties/:idOrSlug/preview"
              element={
                <RequireAuth>
                  <SellerPropertyPreviewRoute />
                </RequireAuth>
              }
            />

            {/* Authenticated Account Workspace */}
            <Route
              path="account"
              element={
                <RequireAuth>
                  <AccountLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BuyerDashboardRoute />} />
              <Route path="profile" element={<ProfilePageRoute />} />
            </Route>

            <Route
              path="seller"
              element={
                <RequireAuth>
                  <AccountLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SellerDashboardRoute />} />
              <Route path="profile" element={<ProfilePageRoute />} />
            </Route>
          </Route>

          {/* ─── ADMIN CRM AUTHENTICATION ───────────────────── */}
          <Route path="admin/login" element={<AdminLoginRoute />} />
          <Route path="admin/forgot-password" element={<AdminForgotPasswordRoute />} />
          <Route path="admin/reset-password" element={<AdminResetPasswordRoute />} />
          <Route path="admin/access-denied" element={<AdminAccessDeniedRoute />} />

          {/* ─── PROTECTED ADMIN CRM PORTAL ─────────────────── */}
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminPortalLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminModuleWrapper module="dashboard" />} />
            <Route path="leads" element={<AdminModuleWrapper module="leads" />} />
            <Route path="leads/:id" element={<AdminModuleWrapper module="leads" />} />
            <Route path="customers" element={<AdminModuleWrapper module="customers" />} />
            <Route path="properties" element={<AdminModuleWrapper module="properties" />} />
            <Route path="projects" element={<AdminModuleWrapper module="projects" />} />
            <Route path="site-visits" element={<AdminModuleWrapper module="site-visits" />} />
            <Route path="bookings" element={<AdminModuleWrapper module="bookings" />} />
            <Route path="tasks" element={<AdminModuleWrapper module="tasks" />} />
            <Route path="team" element={<AdminModuleWrapper module="team" />} />
            <Route path="reports" element={<AdminModuleWrapper module="reports" />} />
            <Route path="masters" element={<AdminModuleWrapper module="masters" />} />
            <Route path="masters/:type" element={<AdminModuleWrapper module="masters" />} />
            <Route path="content" element={<AdminModuleWrapper module="content" />} />
            <Route path="settings" element={<AdminModuleWrapper module="settings" />} />
            <Route path="audit-logs" element={<AdminModuleWrapper module="audit-log" />} />
          </Route>

          {/* ─── CATCH-ALL 404 NOT FOUND ────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
};
