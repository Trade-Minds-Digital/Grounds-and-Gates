import React from 'react';
import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { PropertiesPage } from '../pages/PropertiesPage';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { ComparePage } from '../pages/ComparePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { PostPropertyPage } from '../pages/PostPropertyPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { AuthPages } from '../pages/AuthPages';
import { PropertyDetailsSkeleton } from '../components/common/Skeleton';
import { NotFoundPage } from '../components/common/NotFoundPage';
import { ErrorState } from '../components/common/ErrorState';
import { SellerPropertyPreviewPage } from '../pages/SellerPropertyPreviewPage';

const PropertyUnavailableView: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F2] px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-[#18241B] tracking-tight mb-2">
          Listing Unavailable
        </h2>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          This property listing is currently private, under administrative title clearance, or no longer active on Grounds &amp; Gates.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/properties')}
            className="flex-1 py-3 bg-[#013E18] text-[#F5F2E9] rounded-xl font-bold text-xs hover:bg-[#00280f] transition-all cursor-pointer"
          >
            Browse Verified Properties
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl font-bold text-xs hover:bg-stone-50 transition-all cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

import { useProperties, useProperty, useMapMarkers } from '../query/hooks/usePropertyQueries';
import { useCurrentUser } from '../query/hooks/useAuthQueries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  toggleSaveProperty,
  toggleCompareProperty,
  clearSavedProperties,
  openEnquiryModal,
  openAuthModal,
} from '../store/slices/uiSlice';
import { addToast } from '../store/slices/toastSlice';
import { PropertyFilterState } from '../types/property';
import { getSafeRedirectPath } from '../utils/navigationUtils';

export const HomePageRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  const { data: currentUser } = useCurrentUser();
  const { data: properties = [], isLoading, isError, refetch } = useProperties();

  const handleToggleSave = (id: string) => {
    if (!currentUser) {
      dispatch(
        openAuthModal({
          mode: 'login',
          contextMessage: 'Sign in to save this property to your shortlisted favorites.',
          postAuthAction: { type: 'save-property', propertyId: id },
          trigger: 'user',
        })
      );
      return;
    }
    dispatch(toggleSaveProperty(id));
  };

  if (isError) {
    return <ErrorState title="Failed to Load Properties" onRetry={() => refetch()} />;
  }

  return (
    <HomePage
      properties={properties}
      lang={lang}
      onNavigate={(view, params) => {
        if (view === 'properties') {
          const qs = new URLSearchParams(params || {}).toString();
          navigate(`/properties${qs ? `?${qs}` : ''}`);
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
      savedPropertyIds={savedPropertyIds}
      onToggleSave={handleToggleSave}
      comparedPropertyIds={comparedPropertyIds}
      onToggleCompare={(id) => dispatch(toggleCompareProperty(id))}
      onSelectProperty={(id) => navigate(`/properties/${id}`)}
    />
  );
};

export const PropertiesPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  // Extract filters from URL search params
  const activeFilters = React.useMemo<Partial<PropertyFilterState>>(() => {
    const filters: Partial<PropertyFilterState> = {};
    if (searchParams.get('searchQuery')) filters.searchQuery = searchParams.get('searchQuery')!;
    if (searchParams.get('listingType')) filters.listingType = searchParams.get('listingType') as any;
    if (searchParams.get('category')) filters.category = searchParams.get('category') as any;
    if (searchParams.get('district')) filters.district = searchParams.get('district')!;
    if (searchParams.get('locality')) filters.locality = searchParams.get('locality')!;
    if (searchParams.get('ownershipType')) filters.ownershipType = searchParams.get('ownershipType') as any;
    if (searchParams.get('minPrice')) filters.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) filters.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.get('bedrooms')) filters.bedrooms = searchParams.get('bedrooms') as any;
    if (searchParams.get('facing')) filters.facing = searchParams.get('facing') as any;
    if (searchParams.get('sortBy')) filters.sortBy = searchParams.get('sortBy') as any;
    if (searchParams.get('featuredOnly') === 'true') filters.featuredOnly = true;
    if (searchParams.get('nearLat')) filters.nearLat = Number(searchParams.get('nearLat'));
    if (searchParams.get('nearLng')) filters.nearLng = Number(searchParams.get('nearLng'));
    if (searchParams.get('radius')) filters.radius = Number(searchParams.get('radius'));
    if (searchParams.get('bbox')) filters.bbox = searchParams.get('bbox')!;
    if (searchParams.get('locationStatus')) filters.locationStatus = searchParams.get('locationStatus') as any;
    return filters;
  }, [searchParams]);

  const { data: properties = [], isLoading, isError, refetch } = useProperties(activeFilters);
  const { data: mapMarkers = [] } = useMapMarkers(activeFilters);
  const { data: currentUser } = useCurrentUser();

  const handleToggleSave = (id: string) => {
    if (!currentUser) {
      dispatch(
        openAuthModal({
          mode: 'login',
          contextMessage: 'Sign in to save this property to your shortlisted favorites.',
          postAuthAction: { type: 'save-property', propertyId: id },
          trigger: 'user',
        })
      );
      return;
    }
    dispatch(toggleSaveProperty(id));
  };

  const handleFilterChange = (newFilters: Partial<PropertyFilterState>) => {
    const nextParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all' && val !== 'All') {
        nextParams.set(key, String(val));
      }
    });
    setSearchParams(nextParams);
  };

  if (isError) {
    return <ErrorState title="Failed to Load Properties" onRetry={() => refetch()} />;
  }

  return (
    <PropertiesPage
      properties={properties}
      mapMarkers={mapMarkers}
      lang={lang}
      initialFilters={activeFilters}
      onNavigate={(view, params) => {
        if (view === 'properties' && params) {
          handleFilterChange(params);
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
      savedPropertyIds={savedPropertyIds}
      onToggleSave={handleToggleSave}
      comparedPropertyIds={comparedPropertyIds}
      onToggleCompare={(id) => dispatch(toggleCompareProperty(id))}
      onSelectProperty={(id) => navigate(`/properties/${id}`)}
    />
  );
};

export const PropertyDetailsRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  const { data: property, isLoading, isError } = useProperty(slug);
  const { data: allProperties = [] } = useProperties();
  const { data: currentUser } = useCurrentUser();

  const handleToggleSave = (id: string) => {
    if (!currentUser) {
      dispatch(
        openAuthModal({
          mode: 'login',
          contextMessage: 'Sign in to save this property to your shortlisted favorites.',
          postAuthAction: { type: 'save-property', propertyId: id },
          trigger: 'user',
        })
      );
      return;
    }
    dispatch(toggleSaveProperty(id));
  };

  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  if (isError || !property) {
    return <PropertyUnavailableView />;
  }

  const propId = property.id || property.referenceId || (property as any)._id?.toString() || '';

  return (
    <PropertyDetailsPage
      property={property}
      allProperties={allProperties}
      lang={lang}
      onBack={() => navigate(-1)}
      isSaved={savedPropertyIds.includes(propId)}
      savedPropertyIds={savedPropertyIds}
      onToggleSave={handleToggleSave}
      isCompared={comparedPropertyIds.includes(propId)}
      comparedPropertyIds={comparedPropertyIds}
      onToggleCompare={(id) => dispatch(toggleCompareProperty(id))}
      onSelectProperty={(id) => navigate(`/properties/${id}`)}
      onOpenEnquiry={() => dispatch(openEnquiryModal(propId))}
    />
  );
};

export const ComparePageRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  const { data: allProperties = [] } = useProperties();
  const comparedProperties = React.useMemo(() => {
    return allProperties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [allProperties, comparedPropertyIds]);

  return (
    <ComparePage
      comparedProperties={comparedProperties}
      allProperties={allProperties}
      lang={lang}
      onRemoveFromCompare={(id) => dispatch(toggleCompareProperty(id))}
      onAddToCompare={(id) => dispatch(toggleCompareProperty(id))}
      onSelectProperty={(id) => navigate(`/properties/${id}`)}
      onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)}
    />
  );
};

export const FavoritesPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  const { data: allProperties = [] } = useProperties();
  const savedProperties = React.useMemo(() => {
    return allProperties.filter((p) => savedPropertyIds.includes(p.id));
  }, [allProperties, savedPropertyIds]);

  return (
    <FavoritesPage
      savedProperties={savedProperties}
      lang={lang}
      onToggleSave={(id: string) => dispatch(toggleSaveProperty(id))}
      comparedPropertyIds={comparedPropertyIds}
      onToggleCompare={(id: string) => dispatch(toggleCompareProperty(id))}
      onClearAll={() => dispatch(clearSavedProperties())}
      onSelectProperty={(id: string) => navigate(`/properties/${id}`)}
      onNavigate={(view: string) => navigate(view.startsWith('/') ? view : `/${view}`)}
    />
  );
};

export const PostPropertyPageRoute: React.FC<{ isEditMode?: boolean }> = ({ isEditMode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { idOrSlug } = useParams<{ idOrSlug?: string }>();
  const lang = useAppSelector((state) => state.ui.language);

  return (
    <PostPropertyPage
      lang={lang}
      isEditMode={isEditMode}
      editIdOrSlug={idOrSlug}
      onListingCreated={(newProp) => {
        dispatch(
          addToast({
            type: 'success',
            message: isEditMode
              ? `Property '${newProp.title}' updated successfully!`
              : `Property '${newProp.title}' submitted successfully!`,
          })
        );
        const target = newProp.slug || (newProp as any).referenceId || newProp.id;
        navigate(`/seller/preview/${target}`);
      }}
      onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)}
    />
  );
};

export const SellerPropertyPreviewRoute: React.FC = () => {
  return <SellerPropertyPreviewPage />;
};

export const AboutPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const lang = useAppSelector((state) => state.ui.language);

  return <AboutPage lang={lang} onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)} />;
};

export const ContactPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);

  return (
    <ContactPage
      lang={lang}
      onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)}
      onShowToast={(message, type) => dispatch(addToast({ message, type }))}
    />
  );
};

export const AuthPageRoute: React.FC<{ initialTab?: 'login' | 'register' | 'forgot-password' }> = ({
  initialTab = 'login',
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { data: user, isLoading } = useCurrentUser();

  const rawReturnUrl = searchParams.get('returnUrl');
  const safeReturnUrl = getSafeRedirectPath(rawReturnUrl, '/account/dashboard');

  React.useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate(safeReturnUrl, { replace: true });
      } else {
        dispatch(
          openAuthModal({
            mode: initialTab,
            redirectPath: safeReturnUrl,
            trigger: 'compatibility-route',
          })
        );
      }
    }
  }, [isLoading, user, initialTab, safeReturnUrl, dispatch, navigate]);

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to={safeReturnUrl} replace />;
  }

  // Preserve compatibility: render over public home page and open the modal,
  // so if visitor closes/cancels, they remain on the home page with zero redirect loop
  return <Navigate to="/" replace />;
};

export { VerifyEmailPage as VerifyEmailPageRoute } from '../pages/VerifyEmailPage';
export { AuthActionPage as AuthActionPageRoute } from '../pages/AuthActionPage';
export { ProfilePage as ProfilePageRoute } from '../pages/ProfilePage';
