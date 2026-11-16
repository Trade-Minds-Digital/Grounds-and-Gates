import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AiPropertyAssistant } from '../components/ai/AiPropertyAssistant';
import { ToastContainer } from '../components/common/ToastContainer';
import { AuthModal } from '../pages/AuthModal';
import { EnquiryModal } from '../components/property/EnquiryModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguage, openAuthModal, closeAuthModal, closeEnquiryModal } from '../store/slices/uiSlice';
import { useCurrentUser, useLogout } from '../query/hooks/useAuthQueries';
import { useProperty, useProperties } from '../query/hooks/usePropertyQueries';
import { useCreateLead } from '../query/hooks/useCrmQueries';
import { useAutoAuthModalPrompt } from '../hooks/useAutoAuthModalPrompt';
import { LanguageCode } from '../types/property';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);
  const activeAuthModal = useAppSelector((state) => state.ui.activeAuthModal);
  const activeEnquiryModal = useAppSelector((state) => state.ui.activeEnquiryModal);

  const { data: currentUser } = useCurrentUser();
  const { data: properties = [] } = useProperties();
  const logoutMutation = useLogout();
  const createLeadMutation = useCreateLead();

  // 5-second automatic login modal prompt for logged-out public visitors
  useAutoAuthModalPrompt();

  const { data: modalProperty } = useProperty(activeEnquiryModal.propertyId);

  // Map router path to legacy currentView token for navbar highlighting
  const currentView = React.useMemo(() => {
    const path = location.pathname.replace(/^\/Grounds-and-Gates/, '');
    if (path === '' || path === '/') return 'home';
    if (path.startsWith('/properties')) return 'properties';
    if (path.startsWith('/property/')) return 'property-details';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path === '/compare') return 'compare';
    if (path === '/favorites') return 'favorites';
    if (path === '/post-property') return 'post-property';
    if (path.startsWith('/account')) return 'buyer-dashboard';
    if (path.startsWith('/seller')) return 'seller-dashboard';
    if (path.startsWith('/admin')) return 'admin-dashboard';
    return 'home';
  }, [location.pathname]);

  const handleNavigate = (view: string, params?: any) => {
    if (view === 'home') {
      navigate('/');
    } else if (view === 'properties') {
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '' && val !== 'all' && val !== 'All') {
            searchParams.set(key, String(val));
          }
        });
        navigate(`/properties?${searchParams.toString()}`);
      } else {
        navigate('/properties');
      }
    } else if (view === 'property-details' && params?.id) {
      navigate(`/properties/${params.id}`);
    } else if (view === 'about') {
      navigate('/about');
    } else if (view === 'contact') {
      navigate('/contact');
    } else if (view === 'compare') {
      navigate('/compare');
    } else if (view === 'favorites') {
      navigate('/favorites');
    } else if (view === 'post-property') {
      navigate('/post-property');
    } else if (view === 'buyer-dashboard') {
      navigate('/account/dashboard');
    } else if (view === 'seller-dashboard') {
      navigate('/seller/dashboard');
    } else if (view === 'admin-dashboard' || view.startsWith('admin-')) {
      navigate(view === 'admin-login' ? '/admin/login' : '/admin/dashboard');
    } else if (view.startsWith('/')) {
      navigate(view);
    } else {
      navigate(`/${view}`);
    }
  };

  const handleOpenAuth = (mode?: 'login' | 'register') => {
    dispatch(openAuthModal(mode));
  };

  const handleCloseAuth = () => {
    dispatch(closeAuthModal());
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F2] text-[#18241B] font-sans antialiased selection:bg-[#C99325]/20 selection:text-[#013E18]">

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        lang={lang}
        onLanguageChange={(l: LanguageCode) => dispatch(setLanguage(l))}
        savedCount={savedPropertyIds.length}
        compareCount={comparedPropertyIds.length}
        selectedLocation="All"
        onLocationChange={(loc) => handleNavigate('properties', { district: loc })}
        userRole={(currentUser?.role as any) || 'buyer'}
        onUserRoleChange={() => {}}
        onOpenAuth={handleOpenAuth}
        isLoggedIn={Boolean(currentUser)}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer
        lang={lang}
        onNavigate={handleNavigate}
        onLanguageChange={(l: LanguageCode) => dispatch(setLanguage(l))}
      />

      <AiPropertyAssistant
        properties={properties}
        lang={lang}
        onSelectProperty={(id) => handleNavigate('property-details', { id })}
        onNavigate={handleNavigate}
      />
      <ToastContainer />

      {/* Global Auth Modal */}
      {activeAuthModal.isOpen && (
        <AuthModal
          isOpen={activeAuthModal.isOpen}
          onClose={handleCloseAuth}
          initialMode={activeAuthModal.mode}
          contextMessage={activeAuthModal.contextMessage}
          redirectPath={activeAuthModal.redirectPath}
          lang={lang}
          onLoginSuccess={() => handleCloseAuth()}
        />
      )}

      {/* Global Enquiry Modal */}
      {activeEnquiryModal.isOpen && modalProperty && (
        <EnquiryModal
          isOpen={activeEnquiryModal.isOpen}
          property={modalProperty}
          lang={lang}
          onClose={() => dispatch(closeEnquiryModal())}
          onSubmitEnquiry={(sub) => {
            createLeadMutation.mutate({
              buyerName: sub.fullName,
              phone: sub.phone,
              email: sub.email,
              propertyTitle: sub.propertyTitle,
              propertyId: sub.propertyId,
              message: `[Preferred Slot: ${sub.preferredTimeSlot}] [Visit Date: ${sub.visitDate}] ${sub.message || ''}`,
              stage: 'new',
            });
            dispatch(closeEnquiryModal());
          }}
        />
      )}
    </div>
  );
};
