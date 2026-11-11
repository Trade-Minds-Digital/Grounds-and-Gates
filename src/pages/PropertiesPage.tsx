import React, { useState, useMemo, useEffect } from 'react';
import { Property, LanguageCode, PropertyFilterState, PropertyCategory, OwnershipType, FacingDirection } from '../types/property';
import { filterProperties, sortProperties } from '../utils/propertyUtils';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyGridSkeleton } from '../components/common/Skeleton';
import { translations } from '../i18n/translations';
import { CATEGORIES_DATA } from '../data/categories';
import { LOCATIONS_DATA } from '../data/locations';
import {
  SlidersHorizontal,
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  X,
  ChevronDown,
  Building2,
  UserCheck,
  ShieldAlert,
  ArrowUpDown,
  Sparkles,
  RefreshCw
} from 'lucide-react';

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
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
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
                <Building2 className="w-3.5 h-3.5 text-[#C99325]" />
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
                <UserCheck className="w-3.5 h-3.5 text-stone-500" />
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
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden"
        >
          <option value="all">All Categories</option>
          {CATEGORIES_DATA.map(c => (
            <option key={c.id} value={c.id}>
              {lang === 'ta' ? c.tamilName : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* District / Hub */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          {t.filters.locationDistrict}
        </label>
        <select
          value={filters.district}
          onChange={(e) => handleFilterChange('district', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden"
        >
          <option value="All">All Tamil Nadu</option>
          {LOCATIONS_DATA.map(loc => (
            <option key={loc.id} value={loc.name}>
              {loc.name} ({loc.tamilName})
            </option>
          ))}
        </select>
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
        <select
          value={filters.facing}
          onChange={(e) => handleFilterChange('facing', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden"
        >
          <option value="all">Any Facing Direction</option>
          <option value="North">North</option>
          <option value="East">East</option>
          <option value="South">South</option>
          <option value="West">West</option>
          <option value="North-East">North-East</option>
          <option value="South-East">South-East</option>
        </select>
      </div>

      {/* Reset Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 font-bold text-xs text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
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
              Showing <strong>{filteredAndSortedProperties.length}</strong> verified demo properties across Coimbatore, Chennai, and key regional growth corridors.
            </p>
          </div>

          {/* Controls: Sort & Grid/List View & Mobile Filter Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C99325]" />
              <span>Filters ({activeChips.length})</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-2 rounded-xl shadow-xs text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-transparent font-semibold text-[#18241B] outline-hidden cursor-pointer"
              >
                <option value="relevance">{t.filters.relevance}</option>
                <option value="newest">{t.filters.newest}</option>
                <option value="price-low">{t.filters.priceLowHigh}</option>
                <option value="price-high">{t.filters.priceHighLow}</option>
                <option value="area-low">{t.filters.areaLowHigh}</option>
                <option value="area-high">{t.filters.areaHighLow}</option>
              </select>
            </div>

            {/* Grid / List Layout Switcher & Shimmer Demo */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateLoading}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-bold text-stone-600 hover:text-[#013E18] transition-all shadow-xs cursor-pointer"
                title="Preview smooth skeleton loading transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C99325]" />
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
                  <LayoutGrid className="w-4 h-4" />
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
                  <List className="w-4 h-4" />
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
                  <X className="w-3.5 h-3.5" />
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
                  <SlidersHorizontal className="w-4 h-4 text-[#C99325]" />
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
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#18241B]">{t.filters.noResults}</h3>
                <p className="text-xs text-stone-500 mt-2 max-w-sm">
                  {t.filters.noResultsSub}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] transition-all cursor-pointer"
                >
                  {t.filters.reset}
                </button>
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

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#013E18] text-white">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#C99325]" />
                  <span>Filter Properties</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {FilterSidebarContent}
              </div>

              <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="w-1/2 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#013E18] text-white font-bold text-xs"
                >
                  Apply Filters ({filteredAndSortedProperties.length})
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
