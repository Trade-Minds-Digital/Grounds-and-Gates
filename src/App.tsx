/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Property, LanguageCode, UserRole, PropertyFilterState, EnquirySubmission, ListingStatus } from './types/property';
import { INITIAL_PROPERTIES } from './data/properties';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
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

import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPages } from './pages/AuthPages';
import { AiPropertyAssistant } from './components/ai/AiPropertyAssistant';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { EmiCalculator } from './components/calculator/EmiCalculator';
import { api } from './services/api';

export default function App() {
  // Master Property Dataset (Stateful for runtime demo listing additions/modifications)
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('gg_properties');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load properties from localStorage', e);
    }
    return INITIAL_PROPERTIES;
  });

  // Current View & Routing
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [propertiesFilter, setPropertiesFilter] = useState<Partial<PropertyFilterState>>({});
  const [isViewTransitioning, setIsViewTransitioning] = useState<boolean>(false);
  const [transitionTargetView, setTransitionTargetView] = useState<string | null>(null);

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

  // Favorites (Persisted in localStorage)
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gg_saved_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Seed with 2 attractive defaults for instant presentation wow-factor
    return ['gg-cbe-plot-01', 'gg-cbe-villa-01'];
  });

  // Comparison List (Persisted in localStorage, max 4 properties)
  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gg_compared_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Pre-seed with 2 distinct properties to showcase instant comparison capability
    return ['gg-cbe-plot-01', 'tp-cbe-plot-02'];
  });

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

  // Enquiries (Buyer Submissions)
  const [enquiries, setEnquiries] = useState<EnquirySubmission[]>(() => {
    try {
      const saved = localStorage.getItem('gg_enquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'enq-seed-1',
        propertyId: 'gg-cbe-plot-01',
        propertyTitle: 'DTCP & RERA Approved Grand Gated Villa Plot',
        propertyPrice: 3850000,
        propertyLocation: 'Saravanampatti, Coimbatore',
        fullName: 'Mohanraj S.',
        phone: '+91 98422 71000',
        email: 'mohanrajs0410@gmail.com',
        visitDate: '2026-03-05',
        preferredTimeSlot: 'morning',
        message: 'Interested in North-East facing plot. Need to review parent documents on site.',
        submittedAt: '2026-03-01T10:30:00Z',
        status: 'confirmed'
      }
    ];
  });

  // Enquiry Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryProperty, setEnquiryProperty] = useState<Property | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gg_properties', JSON.stringify(properties));
    } catch (e) {}
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('gg_language', lang);
    } catch (e) {}
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('gg_saved_ids', JSON.stringify(savedPropertyIds));
    } catch (e) {}
  }, [savedPropertyIds]);

  useEffect(() => {
    try {
      localStorage.setItem('gg_compared_ids', JSON.stringify(comparedPropertyIds));
    } catch (e) {}
  }, [comparedPropertyIds]);

  useEffect(() => {
    try {
      localStorage.setItem('gg_enquiries', JSON.stringify(enquiries));
    } catch (e) {}
  }, [enquiries]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedPropertyId]);

  // Navigation Handler with Smooth Skeleton Shimmer Transition
  const handleNavigate = (view: string, params?: any) => {
    if (view === 'emi-calculator' || view === 'calculator') {
      setEmiModalOpen(true);
      return;
    }

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
        }
        setCurrentView('properties');
      } else {
        setCurrentView(view);
      }
      setIsViewTransitioning(false);
      setTransitionTargetView(null);
    }, 220);
  };

  // Toggle Save / Favorite
  const handleToggleSave = (propertyId: string) => {
    setSavedPropertyIds(prev => {
      const isSaved = prev.includes(propertyId);
      const updated = isSaved ? prev.filter(id => id !== propertyId) : [...prev, propertyId];
      const property = properties.find(p => p.id === propertyId);
      const title = property ? property.title : 'Property';
      showToast(
        isSaved
          ? `Removed "${title.slice(0, 32)}..." from saved properties`
          : `Saved "${title.slice(0, 32)}..." to your favorites!`,
        isSaved ? 'info' : 'success'
      );
      return updated;
    });
  };

  // Toggle Compare
  const handleToggleCompare = (propertyId: string) => {
    setComparedPropertyIds(prev => {
      if (prev.includes(propertyId)) {
        showToast('Removed from property comparison tray', 'info');
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length >= 4) {
        showToast('Maximum 4 properties can be compared simultaneously.', 'error');
        return prev;
      }
      showToast('Added to comparison tray (View in Compare tab)', 'success');
      return [...prev, propertyId];
    });
  };

  // Post Property Handler
  const handleListingCreated = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
    showToast(`Listing "${newProperty.title.slice(0, 30)}..." posted successfully!`, 'success');
  };

  // Status Change in Seller Dashboard
  const handleUpdatePropertyStatus = (propertyId: string, newStatus: ListingStatus) => {
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, status: newStatus } : p))
    );
    showToast(`Listing status updated to: ${newStatus.toUpperCase()}`, 'info');
  };

  // Sync properties from live REST API if available
  useEffect(() => {
    let isMounted = true;
    api.getProperties().then(res => {
      if (isMounted && res && res.data && res.data.length > 0) {
        setProperties(res.data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Enquiry Submission Handler
  const handleSubmitEnquiry = (submissionData: any) => {
    const newEnquiry: EnquirySubmission = {
      id: `enq-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      ...submissionData
    };

    // Asynchronously sync to backend
    if (submissionData.propertyId) {
      api.createEnquiry({
        propertyId: submissionData.propertyId,
        fullName: submissionData.fullName,
        phone: submissionData.phone,
        email: submissionData.email,
        message: submissionData.message,
        visitDate: submissionData.visitDate,
        preferredTimeSlot: submissionData.preferredTimeSlot,
      }).catch(err => console.warn('Could not persist enquiry to backend:', err));
    }

    setEnquiries(prev => [newEnquiry, ...prev]);
    showToast(`Site visit scheduled! Our Grounds & Gates coordinator will call you.`, 'success');
  };



  // Selected property object for details view
  const currentProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  // Saved & Compared Properties Arrays
  const savedProperties = properties.filter(p => savedPropertyIds.includes(p.id));
  const comparedProperties = properties.filter(p => comparedPropertyIds.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F2] text-[#18241B]">
      
      {/* 1. Announcement Bar */}
      <AnnouncementBar
        lang={lang}
        onExploreClick={() => handleNavigate('properties')}
      />

      {/* 2. Main Sticky Responsive Navbar */}
      <Navbar
        currentView={currentView}
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
          transitionTargetView === 'property-details' ? (
            <PropertyDetailsSkeleton />
          ) : (
            <PageTransitionSkeleton title="Loading Grounds & Gates Marketplace..." />
          )
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
                onToggleSave={handleToggleSave}
                isCompared={comparedPropertyIds.includes(currentProperty.id)}
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
                  setSavedPropertyIds([]);
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
