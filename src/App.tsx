/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Property, LanguageCode, UserRole, PropertyFilterState, EnquirySubmission, ListingStatus } from './types/property';
import { INITIAL_PROPERTIES } from './data/properties';
import { useDemoState } from './context/DemoStateContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { ComparePage } from './pages/ComparePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PostPropertyPage } from './pages/PostPropertyPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AuthModal } from './pages/AuthModal';
import { EnquiryModal } from './components/property/EnquiryModal';
import { PageTransitionSkeleton, PropertyDetailsSkeleton } from './components/common/Skeleton';
import { PageLoader } from './components/common/PageLoader';

import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPages } from './pages/AuthPages';
import { AiPropertyAssistant } from './components/ai/AiPropertyAssistant';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { EmiCalculator } from './components/calculator/EmiCalculator';
import { api } from './services/api';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/admin/AdminResetPasswordPage';
import { AdminAccessDeniedPage } from './pages/admin/AdminAccessDeniedPage';
import { AdminPortalPage } from './pages/admin/AdminPortalPage';
import { AdminUser } from './types/crm';
import { CrmModule, getRoleDisplayName } from './utils/rbac';

// URL Routing Helpers (supports base path /Grounds-and-Gates/ and query/hash fallback)
const getBasePrefix = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/Grounds-and-Gates') ? '/Grounds-and-Gates' : '';
};

const viewToPath = (view: string, params?: any): string => {
  const base = getBasePrefix();
  if (view === 'home') return `${base}/`;
  if (view === 'admin-login') return `${base}/admin/login`;
  if (view === 'admin-forgot-password') return `${base}/admin/forgot-password`;
  if (view === 'admin-reset-password') {
    const token = params?.token ? `?token=${encodeURIComponent(params.token)}` : '';
    return `${base}/admin/reset-password${token}`;
  }
  if (view === 'admin-access-denied') return `${base}/admin/access-denied`;
  if (view.startsWith('admin-')) {
    const mod = view.replace('admin-', '');
    return `${base}/admin/${mod}`;
  }
  if (view === 'property-details' && params?.id) return `${base}/property/${params.id}`;
  if (view === 'properties') {
    if (params?.district) return `${base}/properties?district=${encodeURIComponent(params.district)}`;
    return `${base}/properties`;
  }
  return `${base}/${view}`;
};

const parseRoute = (): { view: string; params: any } => {
  if (typeof window === 'undefined') return { view: 'home', params: {} };
  const pathname = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(search);

  // Check query param override e.g. ?view=admin-login
  if (searchParams.get('view')) {
    const v = searchParams.get('view')!;
    const token = searchParams.get('token') || '';
    return { view: v, params: { token } };
  }

  // Check hash fallback e.g. #/admin/login or #admin-dashboard
  if (hash) {
    const cleanHash = hash.replace(/^#\/?/, '');
    if (cleanHash.startsWith('admin/')) {
      const sub = cleanHash.replace('admin/', '');
      if (sub === 'login') return { view: 'admin-login', params: {} };
      if (sub === 'forgot-password') return { view: 'admin-forgot-password', params: {} };
      if (sub === 'reset-password') return { view: 'admin-reset-password', params: { token: searchParams.get('token') || '' } };
      return { view: `admin-${sub}`, params: {} };
    }
    if (cleanHash.startsWith('admin-')) {
      return { view: cleanHash, params: {} };
    }
  }

  // Normalize path removing base prefix
  const cleanPath = pathname.replace(/^\/Grounds-and-Gates/, '').replace(/\/$/, '') || '/';

  if (cleanPath === '/admin' || cleanPath === '/admin/login') {
    return { view: 'admin-login', params: {} };
  }
  if (cleanPath === '/admin/forgot-password') {
    return { view: 'admin-forgot-password', params: {} };
  }
  if (cleanPath === '/admin/reset-password') {
    return { view: 'admin-reset-password', params: { token: searchParams.get('token') || '' } };
  }
  if (cleanPath === '/admin/access-denied') {
    return { view: 'admin-access-denied', params: {} };
  }
  if (cleanPath.startsWith('/admin/')) {
    const mod = cleanPath.replace('/admin/', '');
    return { view: `admin-${mod}`, params: {} };
  }

  // Public routes
  if (cleanPath.startsWith('/property/')) {
    const id = cleanPath.replace('/property/', '');
    return { view: 'property-details', params: { id } };
  }
  if (cleanPath === '/properties') {
    const district = searchParams.get('district');
    return { view: 'properties', params: district ? { district } : {} };
  }
  if (cleanPath === '/compare') return { view: 'compare', params: {} };
  if (cleanPath === '/favorites') return { view: 'favorites', params: {} };
  if (cleanPath === '/post-property') return { view: 'post-property', params: {} };
  if (cleanPath === '/buyer-dashboard') return { view: 'buyer-dashboard', params: {} };
  if (cleanPath === '/seller-dashboard') return { view: 'seller-dashboard', params: {} };
  if (cleanPath === '/about') return { view: 'about', params: {} };
  if (cleanPath === '/contact') return { view: 'contact', params: {} };
  if (cleanPath === '/login') return { view: 'login', params: {} };
  if (cleanPath === '/register') return { view: 'register', params: {} };

  return { view: 'home', params: {} };
};

export default function App() {
  // Centralized Shared Demo State
  const {
    properties,
    savedPropertyIds,
    comparedPropertyIds,
    savedProperties,
    comparedProperties,
    leads,
    siteVisits,
    getPropertyById,
    addProperty,
    updatePropertyStatus,
    toggleSaveProperty,
    toggleCompareProperty,
    clearFavorites,
    addLead,
    scheduleSiteVisit,
    resetDemoData,
  } = useDemoState();

  // Current View & Routing (Synchronized with URL path and history)
  const initialRoute = useMemo(() => parseRoute(), []);
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(initialRoute.params?.id || null);
  const [propertiesFilter, setPropertiesFilter] = useState<Partial<PropertyFilterState>>(initialRoute.params?.district ? { district: initialRoute.params.district } : {});
  const [resetPasswordToken, setResetPasswordToken] = useState<string>(initialRoute.params?.token || '');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isViewTransitioning, setIsViewTransitioning] = useState<boolean>(false);
  const [transitionTargetView, setTransitionTargetView] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Popstate listener for browser back/forward and direct URL navigation
  useEffect(() => {
    const onPopState = () => {
      const route = parseRoute();
      setCurrentView(route.view);
      if (route.params?.id) setSelectedPropertyId(route.params.id);
      if (route.params?.token) setResetPasswordToken(route.params.token);
      if (route.params?.district) setPropertiesFilter({ district: route.params.district });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Initial Entrance Page Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Language State (Persisted in localStorage)
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('gg_language');
      if (saved === 'ta' || saved === 'en') return saved;
    } catch (e) {}
    return 'en';
  });

  // Selected Target Location
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // User Authentication & Role State
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Interactive Tools State
  const [emiModalOpen, setEmiModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Notification Trigger
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Unified Enquiries derived reactively from Centralized Demo State (Leads + Site Visits)
  const enquiries: EnquirySubmission[] = useMemo(() => {
    return leads.map(l => {
      const prop = getPropertyById(l.propertyId);
      const visit = siteVisits.find(v => v.leadId === l.id);
      return {
        id: l.id,
        propertyId: l.propertyId,
        propertyTitle: l.propertyTitle,
        propertyPrice: prop?.price || 0,
        propertyLocation: prop ? `${prop.location}, ${prop.district}` : 'Tamil Nadu',
        fullName: l.buyerName,
        phone: l.phone,
        email: l.email,
        visitDate: visit?.date || l.scheduledVisitDate || undefined,
        preferredTimeSlot: visit?.timeSlot || 'morning',
        message: l.message,
        submittedAt: l.createdAt || new Date().toISOString(),
        status: (l.stage === 'scheduled' || l.stage === 'negotiation' || l.stage === 'won' ? 'confirmed' : 'pending') as 'pending' | 'confirmed' | 'completed'
      };
    });
  }, [leads, siteVisits, getPropertyById]);

  // Enquiry Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryProperty, setEnquiryProperty] = useState<Property | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('gg_language', lang);
    } catch (e) {}
  }, [lang]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedPropertyId]);

  // Navigation Handler with Smooth Skeleton Shimmer Transition & History Sync
  const handleNavigate = (view: string, params?: any) => {
    if (view === 'emi-calculator' || view === 'calculator') {
      setEmiModalOpen(true);
      return;
    }

    // Sync browser address bar with safe History API
    try {
      const targetPath = viewToPath(view, params);
      if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== targetPath) {
        window.history.pushState({ view, params }, '', targetPath);
      }
    } catch (e) {}

    setIsViewTransitioning(true);
    setTransitionTargetView(view);

    setTimeout(() => {
      if (view === 'property-details' && params?.id) {
        setSelectedPropertyId(params.id);
        setCurrentView('property-details');
      } else if (view === 'properties') {
        if (params) {
          setPropertiesFilter(params);
          if (params.district) {
            setSelectedLocation(params.district);
          }
        } else {
          setPropertiesFilter({});
        }
        setCurrentView('properties');
      } else if (view === 'admin-reset-password' && params?.token) {
        setResetPasswordToken(params.token);
        setCurrentView('admin-reset-password');
      } else {
        setPropertiesFilter({});
        setCurrentView(view);
      }
      setIsViewTransitioning(false);
      setTransitionTargetView(null);
    }, 220);
  };

  // Toggle Save / Favorite
  const handleToggleSave = (propertyId: string) => {
    const isSaved = savedPropertyIds.includes(propertyId);
    toggleSaveProperty(propertyId);
    const property = properties.find(p => p.id === propertyId);
    const title = property ? property.title : 'Property';
    showToast(
      isSaved
        ? `Removed "${title.slice(0, 32)}..." from saved properties`
        : `Saved "${title.slice(0, 32)}..." to your favorites!`,
      isSaved ? 'info' : 'success'
    );
  };

  // Toggle Compare
  const handleToggleCompare = (propertyId: string) => {
    if (comparedPropertyIds.includes(propertyId)) {
      toggleCompareProperty(propertyId);
      showToast('Removed from property comparison tray', 'info');
      return;
    }
    if (comparedPropertyIds.length >= 4) {
      showToast('Maximum 4 properties can be compared simultaneously.', 'error');
      return;
    }
    toggleCompareProperty(propertyId);
    showToast('Added to comparison tray (View in Compare tab)', 'success');
  };

  // Post Property Handler
  const handleListingCreated = (newProperty: Property) => {
    addProperty(newProperty);
    showToast(`Listing "${newProperty.title.slice(0, 30)}..." posted successfully!`, 'success');
  };

  // Status Change in Seller Dashboard
  const handleUpdatePropertyStatus = (propertyId: string, newStatus: ListingStatus) => {
    updatePropertyStatus(propertyId, newStatus);
    showToast(`Listing status updated to: ${newStatus.toUpperCase()}`, 'info');
  };

  // Enquiry Submission Handler
  const handleSubmitEnquiry = (submissionData: any) => {
    // Create connected Lead in centralized demo state
    const createdLead = addLead({
      customerId: 'cust-mohan-01',
      buyerName: submissionData.fullName,
      phone: submissionData.phone,
      email: submissionData.email,
      propertyId: submissionData.propertyId,
      propertyTitle: submissionData.propertyTitle,
      stage: submissionData.visitDate ? 'scheduled' : 'new',
      priority: 'high',
      assignedEmployeeId: 'emp-senthil-01',
      message: submissionData.message,
      date: 'Just now',
      scheduledVisitDate: submissionData.visitDate || null,
    });

    // Schedule site visit if requested
    if (submissionData.visitDate) {
      scheduleSiteVisit({
        leadId: createdLead.id,
        propertyId: submissionData.propertyId,
        propertyTitle: submissionData.propertyTitle,
        customerId: 'cust-mohan-01',
        customerName: submissionData.fullName,
        customerPhone: submissionData.phone,
        assignedEmployeeId: 'emp-senthil-01',
        date: submissionData.visitDate,
        timeSlot: (submissionData.preferredTimeSlot as any) || 'morning',
        status: 'scheduled',
        notes: submissionData.message,
        transportProvided: true,
      });
    }

    // Persist enquiry to MERN REST backend
    api.createEnquiry({
      propertyId: submissionData.propertyId,
      fullName: submissionData.fullName,
      phone: submissionData.phone,
      email: submissionData.email,
      message: submissionData.message,
      visitDate: submissionData.visitDate,
      preferredTimeSlot: submissionData.preferredTimeSlot
    }).catch(e => console.warn('Backend sync for enquiry:', e));

    showToast(`Site visit scheduled & synced to CRM! Our coordinator will call you.`, 'success');
  };



  // Selected property object for details view
  const currentProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F2] text-[#18241B]">
      
      {/* Global Animated Page Loader (Icon-Only with Luxury Animation) */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            key="initial-page-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
          >
            <PageLoader fullScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Branch: Dedicated Admin Portal vs Public Marketplace */}
      {currentView.startsWith('admin-') ? (
        <main className="flex-1 min-h-screen">
          {currentView === 'admin-login' && (
            <AdminLoginPage
              lang={lang}
              onLoginSuccess={(user) => {
                setAdminUser(user);
                showToast(`Welcome back, ${user.fullName || user.name || 'Admin'}! Signed in as ${getRoleDisplayName(user.role, lang)}.`, 'success');
                handleNavigate('admin-dashboard');
              }}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'admin-forgot-password' && (
            <AdminForgotPasswordPage
              lang={lang}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'admin-reset-password' && (
            <AdminResetPasswordPage
              lang={lang}
              initialToken={resetPasswordToken}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'admin-access-denied' && (
            <AdminAccessDeniedPage
              lang={lang}
              onNavigate={handleNavigate}
              onLogout={async () => {
                await api.logout();
                setAdminUser(null);
                handleNavigate('admin-login');
              }}
              requiredRole="Staff Administrator"
            />
          )}

          {currentView.startsWith('admin-') &&
            currentView !== 'admin-login' &&
            currentView !== 'admin-forgot-password' &&
            currentView !== 'admin-reset-password' &&
            currentView !== 'admin-access-denied' && (
              <AdminPortalPage
                initialModule={currentView.replace('admin-', '') as CrmModule}
                lang={lang}
                onLanguageChange={setLang}
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
        </main>
      ) : (
        <>
          {/* 1. Main Sticky Responsive Navbar */}
          <Navbar
            currentView={currentView}
            activeFilter={propertiesFilter}
            onNavigate={handleNavigate}
            lang={lang}
            onLanguageChange={setLang}
            savedCount={savedPropertyIds.length}
            compareCount={comparedPropertyIds.length}
            selectedLocation={selectedLocation}
            onLocationChange={(loc) => {
              setSelectedLocation(loc);
              if (loc !== 'All') {
                handleNavigate('properties', { district: loc });
              }
            }}
            userRole={userRole}
            onUserRoleChange={setUserRole}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'login');
              setAuthModalOpen(true);
            }}
            isLoggedIn={isLoggedIn}
            onLogout={() => {
              setIsLoggedIn(false);
              showToast('You have been logged out.', 'info');
            }}
          />

          {/* 3. Main Dynamic Content View */}
          <main className="flex-1">
            {isViewTransitioning ? (
              <PageLoader />
            ) : (
              <>
                {currentView === 'home' && (
                  <HomePage
                    properties={properties}
                    lang={lang}
                    onNavigate={handleNavigate}
                    savedPropertyIds={savedPropertyIds}
                    onToggleSave={handleToggleSave}
                    comparedPropertyIds={comparedPropertyIds}
                    onToggleCompare={handleToggleCompare}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                  />
                )}

                {currentView === 'properties' && (
                  <PropertiesPage
                    properties={properties}
                    lang={lang}
                    initialFilters={propertiesFilter}
                    onNavigate={handleNavigate}
                    savedPropertyIds={savedPropertyIds}
                    onToggleSave={handleToggleSave}
                    comparedPropertyIds={comparedPropertyIds}
                    onToggleCompare={handleToggleCompare}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                  />
                )}

                {currentView === 'property-details' && currentProperty && (
                  <PropertyDetailsPage
                    property={currentProperty}
                    allProperties={properties}
                    lang={lang}
                    onBack={() => handleNavigate('properties')}
                    isSaved={savedPropertyIds.includes(currentProperty.id)}
                    savedPropertyIds={savedPropertyIds}
                    onToggleSave={handleToggleSave}
                    isCompared={comparedPropertyIds.includes(currentProperty.id)}
                    comparedPropertyIds={comparedPropertyIds}
                    onToggleCompare={handleToggleCompare}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                    onOpenEnquiry={() => {
                      setEnquiryProperty(currentProperty);
                      setEnquiryModalOpen(true);
                    }}
                  />
                )}

                {currentView === 'compare' && (
                  <ComparePage
                    comparedProperties={comparedProperties}
                    allProperties={properties}
                    lang={lang}
                    onRemoveFromCompare={handleToggleCompare}
                    onAddToCompare={handleToggleCompare}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'favorites' && (
                  <FavoritesPage
                    savedProperties={savedProperties}
                    lang={lang}
                    onToggleSave={handleToggleSave}
                    comparedPropertyIds={comparedPropertyIds}
                    onToggleCompare={handleToggleCompare}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                    onNavigate={handleNavigate}
                    onClearAll={() => {
                      clearFavorites();
                      showToast('Favorites cleared', 'info');
                    }}
                  />
                )}

                {currentView === 'post-property' && (
                  <PostPropertyPage
                    lang={lang}
                    onListingCreated={handleListingCreated}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'buyer-dashboard' && (
                  <BuyerDashboardPage
                    enquiries={enquiries}
                    savedProperties={savedProperties}
                    comparedProperties={comparedProperties}
                    lang={lang}
                    onNavigate={handleNavigate}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                    onToggleSave={handleToggleSave}
                    onToggleCompare={handleToggleCompare}
                  />
                )}

                {currentView === 'seller-dashboard' && (
                  <SellerDashboardPage
                    properties={properties}
                    lang={lang}
                    onNavigate={handleNavigate}
                    onSelectProperty={(id) => handleNavigate('property-details', { id })}
                    onUpdatePropertyStatus={handleUpdatePropertyStatus}
                  />
                )}

                {currentView === 'about' && (
                  <AboutPage
                    lang={lang}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'contact' && (
                  <ContactPage
                    lang={lang}
                    onNavigate={handleNavigate}
                    onShowToast={showToast}
                  />
                )}

                {currentView === 'login' && (
                  <AuthPages
                    initialMode="login"
                    lang={lang}
                    onNavigate={handleNavigate}
                    onLoginSuccess={(role, user) => {
                      setUserRole(role);
                      setIsLoggedIn(true);
                      showToast(`Welcome back, ${user.name}! Logged in as ${role === 'owner' ? 'Seller/Owner' : 'Property Buyer'}.`, 'success');
                      handleNavigate('home');
                    }}
                    onShowToast={showToast}
                  />
                )}

                {currentView === 'register' && (
                  <AuthPages
                    initialMode="register"
                    lang={lang}
                    onNavigate={handleNavigate}
                    onLoginSuccess={(role, user) => {
                      setUserRole(role);
                      setIsLoggedIn(true);
                      showToast(`Welcome to Grounds & Gates, ${user.name}!`, 'success');
                      handleNavigate('home');
                    }}
                    onShowToast={showToast}
                  />
                )}

                {currentView === 'forgot-password' && (
                  <AuthPages
                    initialMode="forgot-password"
                    lang={lang}
                    onNavigate={handleNavigate}
                    onLoginSuccess={() => {}}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}
          </main>

          {/* 4. Global Brand Footer */}
          <Footer
            lang={lang}
            onNavigate={handleNavigate}
            onLanguageChange={setLang}
          />

          {/* 6. Site Visit & Enquiry Modal */}
          {enquiryProperty && (
            <EnquiryModal
              property={enquiryProperty}
              isOpen={enquiryModalOpen}
              onClose={() => setEnquiryModalOpen(false)}
              lang={lang}
              onSubmitEnquiry={handleSubmitEnquiry}
            />
          )}

          {/* 7. Authentication Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            lang={lang}
            initialMode={authModalMode}
            onLoginSuccess={(role, name) => {
              setUserRole(role);
              setIsLoggedIn(true);
              showToast(`Welcome, ${name}! Signed in as ${role === 'owner' ? 'Seller' : 'Buyer'}.`, 'success');
            }}
          />

          {/* 8. Global AI Property Assistant ("Smart Match AI") */}
          <AiPropertyAssistant
            properties={properties}
            lang={lang}
            onSelectProperty={(id) => handleNavigate('property-details', { id })}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {/* 9. Standalone EMI Loan Calculator Modal */}
      {emiModalOpen && (
        <EmiCalculator
          isModal
          lang={lang}
          onClose={() => setEmiModalOpen(false)}
        />
      )}

      {/* 10. Global Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
}
