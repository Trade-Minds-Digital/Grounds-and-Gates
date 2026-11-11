import React, { useState } from 'react';
import { Property, LanguageCode, PropertyCategory, ListingType } from '../types/property';
import { translations } from '../i18n/translations';
import { CATEGORIES_DATA } from '../data/categories';
import { LOCATIONS_DATA } from '../data/locations';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyGridSkeleton } from '../components/common/Skeleton';
import { InteractiveDiscoveryMap } from '../components/map/InteractiveDiscoveryMap';
import { EmiCalculator } from '../components/calculator/EmiCalculator';
import { formatPriceINR } from '../utils/propertyUtils';
import {
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  TrendingUp,
  Compass,
  CheckCircle,
  FileText,
  Users,
  Eye,
  PlusCircle,
  PlayCircle,
  Star,
  Quote,
  Maximize2,
  Bed,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  properties: Property[];
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  savedPropertyIds: string[];
  onToggleSave: (id: string) => void;
  comparedPropertyIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  properties,
  lang,
  onNavigate,
  savedPropertyIds,
  onToggleSave,
  comparedPropertyIds,
  onToggleCompare,
  onSelectProperty
}) => {
  const t = translations[lang];

  // Hero Search States
  const [heroListingType, setHeroListingType] = useState<ListingType>('buy');
  const [heroSearchText, setHeroSearchText] = useState('');
  const [heroCategory, setHeroCategory] = useState<PropertyCategory | 'all'>('all');
  const [heroLocation, setHeroLocation] = useState('All');
  const [heroBudgetMax, setHeroBudgetMax] = useState<number | 'all'>('all');

  // Featured Properties Filter Tab
  const [featuredTab, setFeaturedTab] = useState<'all' | 'company' | 'third-party' | 'plots' | 'villas'>('all');
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);

  // How it works active tab
  const [journeyTab, setJourneyTab] = useState<'buyer' | 'seller'>('buyer');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('properties', {
      listingType: heroListingType,
      searchQuery: heroSearchText,
      category: heroCategory,
      district: heroLocation,
      maxPrice: heroBudgetMax === 'all' ? null : heroBudgetMax
    });
  };

  // Filtered featured properties for homepage showcase
  const displayedFeatured = properties.filter(p => {
    if (featuredTab === 'company') return p.ownershipType === 'company';
    if (featuredTab === 'third-party') return p.ownershipType === 'third-party';
    if (featuredTab === 'plots') return p.category === 'residential-plots';
    if (featuredTab === 'villas') return p.category === 'villas';
    return p.featured || p.ownershipType === 'company';
  }).slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative bg-[#013E18] text-white pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Background Property Photography with Premium Dark Forest Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="Tamil Nadu Premium Property Architecture"
            className="w-full h-full object-cover object-center opacity-25 animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#00280f]/90 via-[#013E18]/85 to-[#013E18]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99325]/20 border border-[#C99325]/40 text-[#C99325] text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F2E9] leading-tight sm:leading-none">
              {t.hero.headline}
            </h1>

            <p className="mt-4 text-sm sm:text-lg text-stone-200 font-normal max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtext}
            </p>
          </div>

          {/* Search Card Container */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-200/40 text-[#18241B]">
            
            {/* Buy / Rent Switcher */}
            <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
              <button
                type="button"
                onClick={() => setHeroListingType('buy')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  heroListingType === 'buy'
                    ? 'bg-[#013E18] text-white shadow-md'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t.hero.tabBuy}
              </button>
              <button
                type="button"
                onClick={() => setHeroListingType('rent')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  heroListingType === 'rent'
                    ? 'bg-[#013E18] text-white shadow-md'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t.hero.tabRent}
              </button>

              <div className="hidden sm:flex items-center gap-1.5 ml-auto text-xs text-stone-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#C99325]" />
                <span>Verified Documentation</span>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Text Search (Locality/Project) */}
              <div className="md:col-span-4 relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Location or Project
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#C99325] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={heroSearchText}
                    onChange={(e) => setHeroSearchText(e.target.value)}
                    placeholder="Saravanampatti, OMR, Vadavalli..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white focus:ring-1 focus:ring-[#013E18] outline-hidden"
                  />
                </div>
              </div>

              {/* District Hub */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  District / Hub
                </label>
                <select
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                >
                  <option value="All">All Tamil Nadu</option>
                  {LOCATIONS_DATA.map(loc => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.tamilName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Category
                </label>
                <select
                  value={heroCategory}
                  onChange={(e) => setHeroCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES_DATA.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'ta' ? cat.tamilName : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer h-[42px]"
                >
                  <Search className="w-4 h-4 text-[#C99325]" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Quick Post Property Sub-CTA */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-700">Quick Searches:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('properties', { district: 'Coimbatore', category: 'residential-plots' })}
                  className="hover:text-[#013E18] hover:underline cursor-pointer"
                >
                  Plots in Coimbatore
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onNavigate('properties', { district: 'Chennai', category: 'villas' })}
                  className="hover:text-[#013E18] hover:underline cursor-pointer"
                >
                  Villas in ECR Chennai
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onNavigate('properties', { category: 'agricultural-land' })}
                  className="hover:text-[#013E18] hover:underline cursor-pointer"
                >
                  Agricultural Farmlands
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('post-property')}
                className="font-bold text-[#013E18] hover:text-[#C99325] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{t.hero.postFreeCta}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C99325]" />
              </button>
            </div>

          </div>

          {/* Micro Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8 text-center text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="text-xl font-black text-[#C99325]">32</div>
              <div className="text-stone-200 font-semibold">{t.hero.statProperties}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="text-xl font-black text-[#C99325]">10</div>
              <div className="text-stone-200 font-semibold">{t.hero.statCities}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="text-xl font-black text-[#C99325]">100%</div>
              <div className="text-stone-200 font-semibold">{t.hero.statDirect}</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Property Categories Section */}
      <section className="py-16 sm:py-20 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight">
              {t.categories.title}
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              {t.categories.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES_DATA.map(category => (
              <div
                key={category.id}
                onClick={() => onNavigate('properties', { category: category.id })}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-stone-200/80 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C99325]">
                      {category.typicalUnits}
                    </span>
                    <h3 className="text-lg font-bold leading-tight">
                      {lang === 'ta' ? category.tamilName : category.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {lang === 'ta' ? category.tamilDescription : category.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#013E18] group-hover:text-[#C99325] transition-colors">
                    <span>Explore Listings</span>
                    <ArrowRight className="w-4 h-4 text-[#C99325] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Featured Properties Section */}
      <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99325] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hand-Picked Tamil Nadu Real Estate</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight">
                Featured Properties
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Explore an authentic mix of Grounds & Gates direct company projects and verified third-party listings.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: 'All Featured' },
                { id: 'company', label: 'Grounds & Gates Direct' },
                { id: 'third-party', label: 'Third-Party Sellers' },
                { id: 'plots', label: 'Plots' },
                { id: 'villas', label: 'Villas' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (featuredTab !== tab.id) {
                      setIsFeaturedLoading(true);
                      setFeaturedTab(tab.id as any);
                      setTimeout(() => setIsFeaturedLoading(false), 240);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    featuredTab === tab.id
                      ? 'bg-[#013E18] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid or Skeleton Shimmer */}
          {isFeaturedLoading ? (
            <PropertyGridSkeleton count={3} layout="grid" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFeatured.map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  lang={lang}
                  isSaved={savedPropertyIds.includes(prop.id)}
                  onToggleSave={onToggleSave}
                  isCompared={comparedPropertyIds.includes(prop.id)}
                  onToggleCompare={onToggleCompare}
                  onSelect={onSelectProperty}
                  layout="grid"
                />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('properties')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>View All 32 Properties in Marketplace</span>
              <ArrowRight className="w-4 h-4 text-[#C99325]" />
            </button>
          </div>

        </div>
      </section>

      {/* 4. Curated Property Spotlight */}
      <section className="py-16 sm:py-20 bg-[#FAF8F2] border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#013E18] text-[#F5F2E9] rounded-3xl p-8 sm:p-12 border-2 border-[#C99325]/40 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C99325]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="lg:col-span-7 space-y-5 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#C99325] text-white text-[10px] font-black uppercase tracking-wider">
                  Spotlight Enclave
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-stone-200 text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  Grounds & Gates Direct
                </span>
                <span className="text-[10px] text-[#C99325] font-semibold">
                  DTCP & RERA Approved
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                The Royal Gates: 4BHK Ultra-Luxury Smart Villa
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                Master-planned architectural duplex on Avinashi Road, Coimbatore. Featuring private compound perimeter, Italian marble flooring, 40ft paved blacktop access, solar water heating, and 100% vaastu compliance.
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-white/15 text-xs">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Plot Area</div>
                  <div className="font-bold text-[#C99325] text-sm sm:text-base">8.5 Cents</div>
                  <div className="text-[10px] text-stone-400">~3,700 sq.ft</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Built-Up</div>
                  <div className="font-bold text-white text-sm sm:text-base">3,800 sq.ft</div>
                  <div className="text-[10px] text-stone-400">Duplex Layout</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Bedrooms</div>
                  <div className="font-bold text-white text-sm sm:text-base">4 BHK + Study</div>
                  <div className="text-[10px] text-stone-400">Attached Baths</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Facing</div>
                  <div className="font-bold text-[#C99325] text-sm sm:text-base">North-East</div>
                  <div className="text-[10px] text-stone-400">Prime Vaastu</div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div>
                  <div className="text-xs text-stone-400 uppercase font-semibold">Direct Corporate Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#C99325]">
                    ₹2.45 Crore
                  </div>
                  <div className="text-[11px] text-stone-300">All-Inclusive Fixed Direct Pricing</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectProperty('gg-cbe-villa-01')}
                    className="px-6 py-3 rounded-xl bg-[#C99325] text-white hover:bg-[#d99f2b] font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative z-10">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C99325]/40 group cursor-pointer"
                   onClick={() => onSelectProperty('gg-cbe-villa-01')}>
                <img
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=85"
                  alt="The Royal Gates Ultra Luxury Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                  <span>Avinashi Road, Coimbatore</span>
                  <span className="px-2 py-1 rounded bg-[#013E18]/80 text-[#C99325] text-[10px] backdrop-blur-xs">
                    Ready to Occupy
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Explore Properties by Location Hubs */}
      <section className="py-16 sm:py-20 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight">
              {t.locations.title}
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              {t.locations.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {LOCATIONS_DATA.map(loc => (
              <div
                key={loc.id}
                onClick={() => onNavigate('properties', { district: loc.name })}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-stone-300/60 cursor-pointer transition-all duration-300"
              >
                <img
                  src={loc.imageUrl}
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-sm font-bold leading-tight group-hover:text-[#C99325] transition-colors">
                    {loc.name}
                  </div>
                  <div className="text-[11px] text-stone-300 font-normal">
                    {loc.tamilName}
                  </div>
                  <div className="text-[10px] font-semibold text-[#C99325] mt-1">
                    {loc.listingCount} Properties
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Interactive Discovery Map */}
      <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InteractiveDiscoveryMap
            properties={properties}
            lang={lang}
            onNavigate={onNavigate}
            onSelectProperty={onSelectProperty}
          />
        </div>
      </section>

      {/* 6. Why Grounds and Gates? */}
      <section className="py-16 sm:py-20 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99325]">
              Designed Differently
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight mt-1">
              {t.whyUs.title}
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              {t.whyUs.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="p-6 rounded-2xl bg-[#F5F2E9]/60 border border-stone-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#013E18] text-[#C99325] flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#18241B]">{t.whyUs.item1Title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{t.whyUs.item1Desc}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F2E9]/60 border border-stone-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#013E18] text-[#C99325] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#18241B]">{t.whyUs.item2Title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{t.whyUs.item2Desc}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F2E9]/60 border border-stone-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#013E18] text-[#C99325] flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#18241B]">{t.whyUs.item3Title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{t.whyUs.item3Desc}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F2E9]/60 border border-stone-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#013E18] text-[#C99325] flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#18241B]">{t.whyUs.item4Title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{t.whyUs.item4Desc}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F2E9]/60 border border-stone-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#013E18] text-[#C99325] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#18241B]">{t.whyUs.item5Title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{t.whyUs.item5Desc}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. How It Works (Buyer & Seller Journeys) */}
      <section className="py-16 sm:py-20 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight">
              {t.howItWorks.title}
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              {t.howItWorks.subtitle}
            </p>

            {/* Buyer / Seller Toggle */}
            <div className="inline-flex rounded-xl border border-stone-300 bg-white p-1 mt-6 shadow-xs">
              <button
                onClick={() => setJourneyTab('buyer')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  journeyTab === 'buyer'
                    ? 'bg-[#013E18] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.howItWorks.buyerTab}
              </button>
              <button
                onClick={() => setJourneyTab('seller')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  journeyTab === 'seller'
                    ? 'bg-[#013E18] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.howItWorks.sellerTab}
              </button>
            </div>
          </div>

          {journeyTab === 'buyer' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { num: '1', title: t.howItWorks.buyerStep1Title, desc: t.howItWorks.buyerStep1Desc },
                { num: '2', title: t.howItWorks.buyerStep2Title, desc: t.howItWorks.buyerStep2Desc },
                { num: '3', title: t.howItWorks.buyerStep3Title, desc: t.howItWorks.buyerStep3Desc },
                { num: '4', title: t.howItWorks.buyerStep4Title, desc: t.howItWorks.buyerStep4Desc },
                { num: '5', title: t.howItWorks.buyerStep5Title, desc: t.howItWorks.buyerStep5Desc },
              ].map(step => (
                <div key={step.num} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#C99325] text-white font-black text-xs flex items-center justify-center mb-3">
                      {step.num}
                    </div>
                    <h3 className="font-bold text-sm text-[#18241B]">{step.title}</h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { num: '1', title: t.howItWorks.sellerStep1Title, desc: t.howItWorks.sellerStep1Desc },
                { num: '2', title: t.howItWorks.sellerStep2Title, desc: t.howItWorks.sellerStep2Desc },
                { num: '3', title: t.howItWorks.sellerStep3Title, desc: t.howItWorks.sellerStep3Desc },
                { num: '4', title: t.howItWorks.sellerStep4Title, desc: t.howItWorks.sellerStep4Desc },
              ].map(step => (
                <div key={step.num} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#013E18] text-white font-black text-xs flex items-center justify-center mb-3">
                      {step.num}
                    </div>
                    <h3 className="font-bold text-sm text-[#18241B]">{step.title}</h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. Financial Decision Tools: Home Loan EMI Calculator */}
      <section className="py-16 sm:py-20 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99325]">
              {lang === 'ta' ? 'நிதித் திட்டமிடல்' : 'Financial Transparency'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] mt-1">
              Plan Your Property Purchase Confidently
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Calculate loan repayments, estimate monthly outgoings, and analyze principal vs. interest breakdown.
            </p>
          </div>

          <EmiCalculator initialPrice={4500000} lang={lang} />
        </div>
      </section>

      {/* 9. Buyer Experience (Illustrative Demo Testimonials) */}
      <section className="py-16 sm:py-20 bg-[#F5F2E9] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-stone-200 text-stone-600 mb-2">
              Demonstration Showcase Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18241B]">
              Buyer Experience Highlights
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Sample illustrative feedback demonstrating the Grounds and Gates direct purchase experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'K. Rajasekaran',
                location: 'Coimbatore, Saravanampatti',
                property: 'Purchased 5.5 Cents Villa Plot',
                comment: 'The clear reporting of road access width (40ft blacktop) and verified DTCP permit numbers gave my family complete legal peace of mind before visiting the site.',
                rating: 5
              },
              {
                name: 'Ananya & Karthik',
                location: 'Chennai, OMR Corridor',
                property: 'Purchased 3BHK Gated Apartment',
                comment: 'Comparing properties side-by-side on Grounds and Gates made price negotiations completely transparent. Zero brokerage on company inventory was a genuine relief.',
                rating: 5
              },
              {
                name: 'V. Balasubramaniam',
                location: 'Tiruppur, Avinashi Junction',
                property: 'Purchased 4.5 Cents Residential Plot',
                comment: 'Accurate cent-to-sqft conversion and direct coordinator assistance for the site walkthrough helped us finalize our plot in less than two weeks.',
                rating: 5
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: item.rating }).map((_, r) => (
                      <Star key={r} className="w-3.5 h-3.5 fill-[#C99325] text-[#C99325]" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 italic leading-relaxed">
                    "{item.comment}"
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-stone-100">
                  <div className="font-bold text-xs text-[#18241B]">{item.name}</div>
                  <div className="text-[10px] text-stone-400">{item.location} • {item.property}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Call To Action Banner */}
      <section className="bg-[#013E18] text-[#F5F2E9] py-16 sm:py-20 border-t border-[#013E18]/60 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-white">
            {t.cta.headline}
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {t.cta.subtext}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('properties')}
              className="px-6 py-3 rounded-xl bg-[#C99325] text-white font-bold text-sm hover:bg-[#d99f2b] shadow-lg transition-all cursor-pointer"
            >
              {t.cta.exploreBtn}
            </button>
            <button
              onClick={() => onNavigate('post-property')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F2E9] border border-white/30 font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#C99325]" />
              <span>{t.cta.postBtn}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
