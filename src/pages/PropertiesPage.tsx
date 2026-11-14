import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, LanguageCode, PropertyFilterState, PropertyCategory, OwnershipType, FacingDirection } from '../types/property';
import { filterProperties, sortProperties } from '../utils/propertyUtils';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyGridSkeleton } from '../components/common/Skeleton';
import { translations } from '../i18n/translations';
import { useAppState } from '../context/AppStateContext';
import { CATEGORIES_DATA } from '../data/categories';
import { LOCATIONS_DATA } from '../data/locations';
import { Select, MenuItem, FormControl } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ApartmentIcon from '@mui/icons-material/Apartment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PropertiesPageProps {
  properties: Property[];
  lang: LanguageCode;
  initialFilters?: Partial<PropertyFilterState>;
  onNavigate: (view: string, params?: any) => void;
  savedPropertyIds: string[];
  onToggleSave: (id: string) => void;
  comparedPropertyIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
}

const DEFAULT_FILTERS: PropertyFilterState = {
  searchQuery: '',
  listingType: 'all',
  category: 'all',
  district: 'All',
  locality: 'All',
  minPrice: null,
  maxPrice: null,
  minArea: null,
  maxArea: null,
  bedrooms: 'all',
  bathrooms: 'all',
  facing: 'all',
  ownershipType: 'all',
  featuredOnly: false,
  sortBy: 'relevance'
};

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  properties,
  lang,
  initialFilters = {},
  onNavigate,
  savedPropertyIds,
  onToggleSave,
  comparedPropertyIds,
  onToggleCompare,
  onSelectProperty
}) => {
  const t = translations[lang];
  const { masters } = useAppState();

  const categoriesList = useMemo(() => {
    if (masters['property_category'] && masters['property_category'].length > 0) {
      return masters['property_category'].map(c => ({ id: c.code, name: c.name, tamilName: c.nameTa || c.name }));
    }
    return CATEGORIES_DATA;
  }, [masters]);

  const districtsList = useMemo(() => {
    if (masters['district'] && masters['district'].length > 0) {
      return masters['district'].map(d => ({ id: d.code, name: d.name, tamilName: d.nameTa || d.name }));
    }
    return LOCATIONS_DATA;
  }, [masters]);

  // Combined Filters State
  const [filters, setFilters] = useState<PropertyFilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger smooth skeleton shimmer on initial render or filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [filters.category, filters.district, filters.listingType, filters.ownershipType, filters.bedrooms, filters.facing, filters.sortBy]);

  const handleFilterChange = (key: keyof PropertyFilterState, value: any) => {
    setIsLoading(true);
    setFilters(prev => ({ ...prev, [key]: value }));
    setVisibleCount(12);
    setTimeout(() => {
      setIsLoading(false);
    }, 280);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(12);
    setTimeout(() => {
      setIsLoading(false);
    }, 280);
  };

  // Skeleton loading simulation trigger
  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  // Filter & Sort Logic
  const filteredAndSortedProperties = useMemo(() => {
    const filtered = filterProperties(properties, filters);
    return sortProperties(filtered, filters.sortBy);
  }, [properties, filters]);

  const displayedProperties = filteredAndSortedProperties.slice(0, visibleCount);

  // Active filter chips list
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.searchQuery) {
      chips.push({
        label: `"${filters.searchQuery}"`,
        onRemove: () => handleFilterChange('searchQuery', '')
      });
    }

    if (filters.listingType !== 'all') {
      chips.push({
        label: filters.listingType === 'buy' ? t.filters.buy : t.filters.rent,
        onRemove: () => handleFilterChange('listingType', 'all')
      });
    }

    if (filters.category !== 'all') {
      const catObj = CATEGORIES_DATA.find(c => c.id === filters.category);
      chips.push({
        label: catObj ? (lang === 'ta' ? catObj.tamilName : catObj.name) : filters.category,
        onRemove: () => handleFilterChange('category', 'all')
      });
    }

    if (filters.district !== 'All' && filters.district) {
      chips.push({
        label: filters.district,
        onRemove: () => handleFilterChange('district', 'All')
      });
    }

    if (filters.ownershipType !== 'all') {
      chips.push({
        label: filters.ownershipType === 'company' ? 'Company Listings' : 'Third-Party Listings',
        onRemove: () => handleFilterChange('ownershipType', 'all')
      });
    }

    if (filters.maxPrice != null) {
      chips.push({
        label: `Max ₹${filters.maxPrice >= 10000000 ? `${(filters.maxPrice / 10000000).toFixed(1)} Cr` : `${(filters.maxPrice / 100000).toFixed(0)} Lakhs`}`,
        onRemove: () => handleFilterChange('maxPrice', null)
      });
    }

    if (filters.bedrooms !== 'all') {
      chips.push({
        label: `${filters.bedrooms} BHK`,
        onRemove: () => handleFilterChange('bedrooms', 'all')
      });
    }

    if (filters.facing !== 'all') {
      chips.push({
        label: `${filters.facing} Facing`,
        onRemove: () => handleFilterChange('facing', 'all')
      });
    }

    return chips;
  }, [filters, lang, t]);

  // Sidebar Filter Form (Shared between desktop and mobile drawer)
  const FilterSidebarContent = (
    <div className="space-y-6 text-xs text-stone-700">
      
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Keywords / Area / Project
        </label>
        <div className="relative">
          <SearchIcon sx={{ fontSize: 16, color: 'text.secondary', position: 'absolute', left: 12, top: 10 }} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            placeholder="Search keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-[#FAF8F2] focus:bg-white focus:border-[#013E18] outline-hidden text-xs"
          />
        </div>
      </div>

      {/* Buy / Rent */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          {t.filters.listingType}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
          {(['all', 'buy', 'rent'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleFilterChange('listingType', type)}
              className={`py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                filters.listingType === type
                  ? 'bg-[#013E18] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {type === 'all' ? t.filters.all : type === 'buy' ? t.filters.buy : t.filters.rent}
            </button>
          ))}
        </div>
      </div>

      {/* Listing Ownership Type Filter (COMPANY vs THIRD-PARTY) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Listing Ownership
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer">
            <input
              type="radio"
              name="ownershipType"
              checked={filters.ownershipType === 'all'}
              onChange={() => handleFilterChange('ownershipType', 'all')}
              className="text-[#013E18] focus:ring-[#013E18]"
            />
            <span className="font-semibold text-stone-700">All Listings ({properties.length})</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg border border-[#013E18]/20 bg-[#013E18]/5 hover:bg-[#013E18]/10 cursor-pointer">
            <input
              type="radio"
              name="ownershipType"
              checked={filters.ownershipType === 'company'}
              onChange={() => handleFilterChange('ownershipType', 'company')}
              className="text-[#013E18] focus:ring-[#013E18]"
            />
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-[#013E18] flex items-center gap-1">
                <ApartmentIcon sx={{ fontSize: 16, color: '#C99325' }} />
                Grounds & Gates Direct
              </span>
              <span className="text-[10px] bg-[#013E18] text-white px-1.5 py-0.5 rounded font-bold">14</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer">
            <input
              type="radio"
              name="ownershipType"
              checked={filters.ownershipType === 'third-party'}
              onChange={() => handleFilterChange('ownershipType', 'third-party')}
              className="text-[#013E18] focus:ring-[#013E18]"
            />
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-stone-700 flex items-center gap-1">
                <VerifiedUserIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                Third-Party Sellers
              </span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">18</span>
            </div>
          </label>
        </div>
      </div>

      {/* Property Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          {t.filters.propertyCategory}
        </label>
        <FormControl fullWidth size="small">
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            sx={{
              height: 38,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#18241B',
              '& fieldset': { borderColor: '#e7e5e4' },
              '&:hover fieldset': { borderColor: '#013E18' },
              '&.Mui-focused fieldset': { borderColor: '#013E18' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>All Categories</MenuItem>
            {categoriesList.map(c => (
              <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.8rem' }}>
                {lang === 'ta' ? c.tamilName : c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* District / Hub */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          {t.filters.locationDistrict}
        </label>
        <FormControl fullWidth size="small">
          <Select
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            sx={{
              height: 38,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#18241B',
              '& fieldset': { borderColor: '#e7e5e4' },
              '&:hover fieldset': { borderColor: '#013E18' },
              '&.Mui-focused fieldset': { borderColor: '#013E18' },
            }}
          >
            <MenuItem value="All" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>All Tamil Nadu</MenuItem>
            {districtsList.map(loc => (
              <MenuItem key={loc.id} value={loc.name} sx={{ fontSize: '0.8rem' }}>
                {loc.name} ({loc.tamilName})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Budget Range */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t.filters.priceRange}
          </label>
          {filters.maxPrice != null && (
            <span className="text-xs font-bold text-[#013E18]">
              Up to {filters.maxPrice >= 10000000 ? `₹${(filters.maxPrice / 10000000).toFixed(1)} Cr` : `₹${(filters.maxPrice / 100000).toFixed(0)} Lakhs`}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('maxPrice', 5000000)}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
              filters.maxPrice === 5000000 ? 'bg-[#013E18] text-white border-[#013E18]' : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            Under ₹50L
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('maxPrice', 10000000)}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
              filters.maxPrice === 10000000 ? 'bg-[#013E18] text-white border-[#013E18]' : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            Under ₹1 Cr
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('maxPrice', 25000000)}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
              filters.maxPrice === 25000000 ? 'bg-[#013E18] text-white border-[#013E18]' : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            Under ₹2.5 Cr
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('maxPrice', null)}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer ${
              filters.maxPrice === null ? 'bg-[#013E18] text-white border-[#013E18]' : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            Any Budget
          </button>
        </div>
      </div>

      {/* Bedrooms (BHK) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          {t.filters.bedrooms}
        </label>
        <div className="grid grid-cols-5 gap-1">
          {['all', 2, 3, 4, 5].map(b => (
            <button
              key={b}
              type="button"
              onClick={() => handleFilterChange('bedrooms', b)}
              className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filters.bedrooms === b
                  ? 'bg-[#013E18] text-white border-[#013E18]'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {b === 'all' ? 'All' : `${b}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Facing Direction */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          {t.filters.facing}
        </label>
        <FormControl fullWidth size="small">
          <Select
            value={filters.facing}
            onChange={(e) => handleFilterChange('facing', e.target.value)}
            sx={{
              height: 38,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#18241B',
              '& fieldset': { borderColor: '#e7e5e4' },
              '&:hover fieldset': { borderColor: '#013E18' },
              '&.Mui-focused fieldset': { borderColor: '#013E18' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Any Facing Direction</MenuItem>
            <MenuItem value="North" sx={{ fontSize: '0.8rem' }}>North</MenuItem>
            <MenuItem value="East" sx={{ fontSize: '0.8rem' }}>East</MenuItem>
            <MenuItem value="South" sx={{ fontSize: '0.8rem' }}>South</MenuItem>
            <MenuItem value="West" sx={{ fontSize: '0.8rem' }}>West</MenuItem>
            <MenuItem value="North-East" sx={{ fontSize: '0.8rem' }}>North-East</MenuItem>
            <MenuItem value="South-East" sx={{ fontSize: '0.8rem' }}>South-East</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Reset Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 font-bold text-xs text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RestartAltIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <span>{t.filters.reset}</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight">
              Tamil Nadu Property Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Showing <strong>{filteredAndSortedProperties.length}</strong> verified properties across Coimbatore, Chennai, and key regional growth corridors.
            </p>
          </div>

          {/* Controls: Sort & Grid/List View & Mobile Filter Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 shadow-xs cursor-pointer"
            >
              <TuneIcon sx={{ fontSize: 16, color: '#C99325' }} />
              <span>Filters ({activeChips.length})</span>
            </button>

            {/* Sort Selector */}
            <FormControl size="small">
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                startAdornment={<SwapVertIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />}
                sx={{
                  height: 38,
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#18241B',
                  '& fieldset': { borderColor: '#e7e5e4' },
                  '&:hover fieldset': { borderColor: '#013E18' },
                  '&.Mui-focused fieldset': { borderColor: '#013E18' },
                }}
              >
                <MenuItem value="relevance" sx={{ fontSize: '0.8rem' }}>{t.filters.relevance}</MenuItem>
                <MenuItem value="newest" sx={{ fontSize: '0.8rem' }}>{t.filters.newest}</MenuItem>
                <MenuItem value="price-low" sx={{ fontSize: '0.8rem' }}>{t.filters.priceLowHigh}</MenuItem>
                <MenuItem value="price-high" sx={{ fontSize: '0.8rem' }}>{t.filters.priceHighLow}</MenuItem>
                <MenuItem value="area-low" sx={{ fontSize: '0.8rem' }}>{t.filters.areaLowHigh}</MenuItem>
                <MenuItem value="area-high" sx={{ fontSize: '0.8rem' }}>{t.filters.areaHighLow}</MenuItem>
              </Select>
            </FormControl>

            {/* Grid / List Layout Switcher & Shimmer Demo */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateLoading}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-bold text-stone-600 hover:text-[#013E18] transition-all shadow-xs cursor-pointer"
                title="Preview smooth skeleton loading transition"
              >
                <AutoAwesomeIcon sx={{ fontSize: 16, color: '#C99325' }} />
                <span>Simulate Transition</span>
              </button>

              <div className="hidden sm:flex items-center rounded-xl border border-stone-200 bg-white p-0.5 shadow-xs">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setLayoutView('grid');
                    setTimeout(() => setIsLoading(false), 200);
                  }}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    layoutView === 'grid'
                      ? 'bg-[#013E18] text-white shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Grid View"
                  aria-label="Switch to grid view"
                >
                  <GridViewIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setLayoutView('list');
                    setTimeout(() => setIsLoading(false), 200);
                  }}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    layoutView === 'list'
                      ? 'bg-[#013E18] text-white shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="List View"
                  aria-label="Switch to list view"
                >
                  <ViewListIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-stone-500 font-semibold">Active Filters:</span>
            {activeChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-2xs"
              >
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </button>
              </span>
            ))}
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#013E18] hover:text-[#C99325] hover:underline ml-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Layout Grid: Left Sidebar + Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2 font-bold text-sm text-[#18241B]">
                  <TuneIcon sx={{ fontSize: 16, color: '#C99325' }} />
                  <span>{t.filters.title}</span>
                </div>
                {activeChips.length > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#C99325] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {FilterSidebarContent}
            </div>
          </div>

          {/* Listings Display Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <PropertyGridSkeleton count={Math.min(displayedProperties.length || 6, 6)} layout={layoutView} />
            ) : displayedProperties.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-4">
                  <SearchIcon sx={{ fontSize: 32 }} />
                </div>
                <h3 className="text-xl font-bold text-[#18241B]">{t.filters.noResults}</h3>
                <p className="text-xs text-stone-500 mt-2 max-w-sm">
                  {t.filters.noResultsSub}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] transition-all cursor-pointer"
                  >
                    {t.filters.reset}
                  </button>
                  <button
                    onClick={() => onNavigate('post-property')}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-[#FAF8F2] transition-all cursor-pointer"
                  >
                    Post a Property
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    layoutView === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-5'
                  }
                >
                  {displayedProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      lang={lang}
                      isSaved={savedPropertyIds.includes(property.id)}
                      onToggleSave={onToggleSave}
                      isCompared={comparedPropertyIds.includes(property.id)}
                      onToggleCompare={onToggleCompare}
                      onSelect={onSelectProperty}
                      layout={layoutView}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredAndSortedProperties.length && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 12)}
                      className="px-8 py-3 rounded-xl bg-white border border-stone-300 hover:border-[#013E18] text-[#013E18] font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      Load More Properties ({filteredAndSortedProperties.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      {/* Animated Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#013E18] text-white">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <TuneIcon sx={{ fontSize: 16, color: '#C99325' }} />
                    <span>Filter Properties</span>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <CloseIcon sx={{ fontSize: 20 }} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  {FilterSidebarContent}
                </div>

                <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="w-1/2 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-[#013E18] text-white font-bold text-xs cursor-pointer"
                  >
                    Apply Filters ({filteredAndSortedProperties.length})
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
