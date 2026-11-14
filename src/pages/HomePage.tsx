import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Property, LanguageCode, PropertyCategory, ListingType } from '../types/property';
import { translations } from '../i18n/translations';
import { useAppState } from '../context/AppStateContext';
import { CATEGORIES_DATA } from '../data/categories';
import { LOCATIONS_DATA } from '../data/locations';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyGridSkeleton } from '../components/common/Skeleton';
import { ArchitecturalDivider } from '../components/common/ArchitecturalDivider';
import { InteractiveDiscoveryMap } from '../components/map/InteractiveDiscoveryMap';
import { EmiCalculator } from '../components/calculator/EmiCalculator';
import { Select, MenuItem, FormControl, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExploreIcon from '@mui/icons-material/Explore';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';

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
  const { masters, webContent } = useAppState();

  // Authoritative Content & Master Overrides
  const heroContent = webContent['homepage_hero'] || {};
  const heroHeadline = lang === 'ta'
    ? (heroContent.titleTa || heroContent.content?.headlineTa || t.hero.headline)
    : (heroContent.title || heroContent.content?.headline || t.hero.headline);
  const heroSubtext = lang === 'ta'
    ? (heroContent.subtitleTa || heroContent.content?.subtextTa || t.hero.subtext)
    : (heroContent.subtitle || heroContent.content?.subtext || t.hero.subtext);
  const heroBadge = lang === 'ta'
    ? (heroContent.content?.headlineBadgeTa || t.hero.badge)
    : (heroContent.content?.headlineBadge || t.hero.badge);

  const categoryList = useMemo(() => {
    if (masters['property_category'] && masters['property_category'].length > 0) {
      return masters['property_category'].map(c => {
        const fallback = CATEGORIES_DATA.find(cat => cat.id === c.code || cat.name.toLowerCase() === c.name.toLowerCase());
        return {
          id: c.code as PropertyCategory,
          name: c.name,
          tamilName: c.nameTa || c.name,
          description: c.description || fallback?.description || '',
          tamilDescription: c.nameTa || fallback?.tamilDescription || '',
          typicalUnits: c.metadata?.typicalUnits || fallback?.typicalUnits || 'Cents / Sq.ft',
          imageUrl: c.metadata?.imageUrl || fallback?.imageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        };
      });
    }
    return CATEGORIES_DATA;
  }, [masters]);

  const locationList = useMemo(() => {
    if (masters['district'] && masters['district'].length > 0) {
      return masters['district'].map(d => {
        const fallback = LOCATIONS_DATA.find(l => l.id.toLowerCase() === d.code.toLowerCase() || l.name.toLowerCase() === d.name.toLowerCase());
        const count = properties.filter(p => p.district?.toLowerCase() === d.name.toLowerCase() || p.district?.toLowerCase() === d.code.toLowerCase()).length;
        return {
          id: d.code,
          name: d.name,
          tamilName: d.nameTa || d.name,
          popularLocalities: fallback?.popularLocalities || [],
          listingCount: count > 0 ? count : (fallback?.listingCount || 0),
          imageUrl: d.metadata?.imageUrl || fallback?.imageUrl || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
          description: d.description || fallback?.description || '',
          isMetro: fallback?.isMetro || false,
        };
      });
    }
    return LOCATIONS_DATA;
  }, [masters, properties]);

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
  }).slice(0, 7);

  const leadSpotlightProperty = featuredTab === 'all' && displayedFeatured.length > 0 ? displayedFeatured[0] : null;
  const gridFeaturedProperties = leadSpotlightProperty ? displayedFeatured.slice(1, 7) : displayedFeatured.slice(0, 6);

  // Dynamic Word-by-word split for animated hero headline
  const heroWords = heroHeadline.split(' ');
  const midPoint = Math.ceil(heroWords.length / 2);
  const heroLine1Words = heroWords.slice(0, midPoint);
  const heroLine2Words = heroWords.slice(midPoint);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F2]">
      
      {/* ===================================================================== */}
      {/* 1. CINEMATIC ARCHITECTURAL HERO EXPERIENCE                            */}
      {/* ===================================================================== */}
      <section className="relative min-h-[82vh] lg:min-h-[93vh] bg-[#00280f] text-white flex flex-col justify-center py-14 sm:py-20 overflow-hidden">
        {/* Full-bleed Architectural Photography with Ambient Ken Burns Zoom */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=90"
            alt="Luxury Architectural Residence in Tamil Nadu"
            className="w-full h-full object-cover object-center opacity-50 animate-ken-burns"
          />
          {/* Carefully Balanced Editorial Scrim: Keeps architectural daylight clear while anchoring text legibility */}
          <div className="absolute bg-gradient-to-r from-[#001d0b]/92 via-[#013E18]/70 to-[#001d0b]/45" />
          <div className="absolute bg-gradient-to-t from-[#001d0b] via-transparent to-[#001d0b]/55" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
            
            {/* Left Editorial Headline Block (8 cols) */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C99325]/50 text-[#F5F2E9] text-[11px] font-bold uppercase tracking-[0.16em] mb-6 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#C99325] animate-pulse" />
                <span>{heroBadge}</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.12]">
                <span className="block">
                  {heroLine1Words.map((word: string, idx: number) => (
                    <motion.span
                      key={`l1-${idx}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.08 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block mr-[0.28em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
                <span className="block text-[#e0aa3e] mt-1">
                  {heroLine2Words.map((word: string, idx: number) => (
                    <motion.span
                      key={`l2-${idx}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.55,
                        delay: 0.08 + (heroLine1Words.length + idx) * 0.06,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="inline-block mr-[0.28em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 text-sm sm:text-lg text-[#F5F2E9]/90 font-normal max-w-xl leading-relaxed"
              >
                {heroSubtext}
              </motion.p>
            </div>

            {/* Right Floating Architectural Property Discovery Badge (4 cols on desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex lg:col-span-4 justify-end"
            >
              <button
                type="button"
                onClick={() => onSelectProperty('gg-cbe-villa-01')}
                className="group text-left bg-black/45 hover:bg-black/65 backdrop-blur-xl border border-white/20 hover:border-[#C99325]/60 rounded-2xl p-4 max-w-xs transition-all duration-300 shadow-2xl cursor-pointer animate-float-gentle"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C99325] flex items-center gap-1.5">
                    <AutoAwesomeIcon sx={{ fontSize: 13 }} />
                    Flagship Residence
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    DTCP Verified
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white group-hover:text-[#e0aa3e] transition-colors">
                  The Royal Gates · 4BHK Villa
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-xs">
                  <span className="text-stone-300 flex items-center gap-1">
                    <LocationOnIcon sx={{ fontSize: 14, color: '#C99325' }} />
                    Coimbatore
                  </span>
                  <span className="font-black text-white flex items-center gap-1">
                    ₹2.45 Cr
                    <ArrowForwardIcon sx={{ fontSize: 14, color: '#C99325' }} />
                  </span>
                </div>
              </button>
            </motion.div>

          </div>

          {/* Floating Glass-Like Search Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.5)] border border-white/60 text-[#18241B]"
          >
            {/* Animated Buy / Rent Toggle Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-stone-200/70">
              <div className="inline-flex p-1 rounded-xl bg-[#F5F2E9] border border-stone-200/80 relative">
                {(['buy', 'rent'] as const).map((type) => {
                  const isActive = heroListingType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setHeroListingType(type)}
                      className={`relative z-10 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                        isActive ? 'text-white' : 'text-stone-600 hover:text-[#013E18]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="hero-buy-rent-pill"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          className="absolute inset-0 bg-[#013E18] rounded-lg shadow-sm -z-10"
                        />
                      )}
                      {type === 'buy' ? t.hero.tabBuy : t.hero.tabRent}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-600 font-semibold">
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <VerifiedUserIcon sx={{ fontSize: 16, color: '#013E18' }} />
                  <span>Direct & Verified Inventory</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#FAF8F2] px-2.5 py-1 rounded-full border border-stone-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C99325]" />
                  <span>{properties.length > 0 ? `${properties.length} Verified Properties Live` : 'Live Marketplace Connected'}</span>
                </span>
              </div>
            </div>

            {/* 4-Control Search Bar */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              {/* Location or Project */}
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                  Locality, Project or Landmark
                </label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Saravanampatti, OMR, Vadavalli..."
                  value={heroSearchText}
                  onChange={(e) => setHeroSearchText(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ fontSize: 18, color: '#C99325' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: '#FAF8F2',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#18241B',
                        '& fieldset': { borderColor: '#e7e5e4' },
                        '&:hover fieldset': { borderColor: '#013E18' },
                        '&.Mui-focused fieldset': { borderColor: '#013E18', borderWidth: 2 },
                      }
                    }
                  }}
                />
              </div>

              {/* District Hub */}
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                  District Hub
                </label>
                <FormControl fullWidth size="small">
                  <Select
                    value={heroLocation}
                    onChange={(e) => setHeroLocation(e.target.value)}
                    displayEmpty
                    sx={{
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: '#FAF8F2',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#18241B',
                      '& fieldset': { borderColor: '#e7e5e4' },
                      '&:hover fieldset': { borderColor: '#013E18' },
                      '&.Mui-focused fieldset': { borderColor: '#013E18', borderWidth: 2 },
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: {
                          sx: {
                            borderRadius: '16px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                            maxHeight: 280,
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="All" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>All Tamil Nadu</MenuItem>
                    {locationList.map(loc => (
                      <MenuItem key={loc.id} value={loc.name} sx={{ fontSize: '0.85rem' }}>
                        {lang === 'ta' ? loc.tamilName : loc.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Category */}
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                  Category
                </label>
                <FormControl fullWidth size="small">
                  <Select
                    value={heroCategory}
                    onChange={(e) => setHeroCategory(e.target.value as any)}
                    displayEmpty
                    sx={{
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: '#FAF8F2',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#18241B',
                      '& fieldset': { borderColor: '#e7e5e4' },
                      '&:hover fieldset': { borderColor: '#013E18' },
                      '&.Mui-focused fieldset': { borderColor: '#013E18', borderWidth: 2 },
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: {
                          sx: {
                            borderRadius: '16px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                            maxHeight: 280,
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="all" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>All Categories</MenuItem>
                    {categoryList.map(cat => (
                      <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '0.85rem' }}>
                        {lang === 'ta' ? cat.tamilName : cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Budget Selector */}
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                  Max Budget
                </label>
                <FormControl fullWidth size="small">
                  <Select
                    value={heroBudgetMax}
                    onChange={(e) => setHeroBudgetMax(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    displayEmpty
                    sx={{
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: '#FAF8F2',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#18241B',
                      '& fieldset': { borderColor: '#e7e5e4' },
                      '&:hover fieldset': { borderColor: '#013E18' },
                      '&.Mui-focused fieldset': { borderColor: '#013E18', borderWidth: 2 },
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: {
                          sx: {
                            borderRadius: '16px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                            maxHeight: 280,
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="all" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.hero.budgetPlaceholder}</MenuItem>
                    <MenuItem value={3500000} sx={{ fontSize: '0.85rem' }}>Up to ₹35 Lakhs</MenuItem>
                    <MenuItem value={7500000} sx={{ fontSize: '0.85rem' }}>Up to ₹75 Lakhs</MenuItem>
                    <MenuItem value={15000000} sx={{ fontSize: '0.85rem' }}>Up to ₹1.5 Crore</MenuItem>
                    <MenuItem value={50000000} sx={{ fontSize: '0.85rem' }}>Up to ₹5 Crore</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Luxury Gate Gold Search Button */}
              <div className="lg:col-span-2">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchIcon sx={{ fontSize: 18, color: '#ffffff' }} />}
                  sx={{
                    width: '100%',
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#C99325',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 20px rgba(201, 147, 37, 0.35)',
                    '&:hover': {
                      bgcolor: '#b8831b',
                      boxShadow: '0 10px 24px rgba(201, 147, 37, 0.45)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Explore
                </Button>
              </div>
            </form>

            {/* Quick Searches & Seller CTA */}
            <div className="mt-4 pt-3.5 border-t border-stone-200/70 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#18241B]">Popular:</span>
                {[
                  { label: 'Coimbatore Plots', params: { district: 'Coimbatore', category: 'residential-plots' } },
                  { label: 'ECR Chennai Villas', params: { district: 'Chennai', category: 'villas' } },
                  { label: 'Pollachi Coconut Farms', params: { category: 'agricultural-land' } },
                  { label: 'Hosur Industrial Spaces', params: { district: 'Hosur' } },
                ].map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => onNavigate('properties', q.params)}
                    className="px-2.5 py-1 rounded-full bg-[#FAF8F2] hover:bg-[#013E18] text-stone-700 hover:text-white border border-stone-200/80 transition-colors cursor-pointer text-[11px] font-semibold"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('post-property')}
                className="font-extrabold text-[#013E18] hover:text-[#C99325] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.hero.postFreeCta}</span>
                <ArrowForwardIcon sx={{ fontSize: 16, color: '#C99325' }} />
              </button>
            </div>
          </motion.div>

          {/* Subtle Bottom Metrics + Scroll Indicator */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-10 text-xs">
              <div>
                <span className="text-xl sm:text-2xl font-black text-[#e0aa3e] block leading-none">{properties.length}+</span>
                <span className="text-stone-300 font-medium mt-1 block">{t.hero.statProperties}</span>
              </div>
              <div className="w-px h-8 bg-white/15 hidden sm:block" />
              <div>
                <span className="text-xl sm:text-2xl font-black text-[#e0aa3e] block leading-none">10</span>
                <span className="text-stone-300 font-medium mt-1 block">{t.hero.statCities}</span>
              </div>
              <div className="w-px h-8 bg-white/15 hidden sm:block" />
              <div>
                <span className="text-xl sm:text-2xl font-black text-[#e0aa3e] block leading-none">100%</span>
                <span className="text-stone-300 font-medium mt-1 block">{t.hero.statDirect}</span>
              </div>
            </div>

            <a
              href="#editorial-standard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-[#e0aa3e] transition-colors group"
            >
              <span className="uppercase tracking-[0.2em] text-[10px]">Scroll to Explore</span>
              <span className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center group-hover:border-[#C99325] transition-colors">
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#C99325' }} />
              </span>
            </a>
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. EDITORIAL NARRATIVE SECTION ("THE GROUNDS & GATES STANDARD")       */}
      {/* ===================================================================== */}
      <section id="editorial-standard" className="py-20 sm:py-28 bg-[#F5F2E9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Architectural Split Visual with Overlapping Seal (6 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] sm:aspect-[5/4] bg-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
                  alt="Modern Architectural Interior & Garden Courtyard"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#013E18]/50 via-transparent to-transparent" />
              </div>

              {/* Overlapping Editorial Verification Panel */}
              <div className="sm:absolute sm:-bottom-6 sm:right-6 mt-4 sm:mt-0 bg-[#013E18] text-[#F5F2E9] p-5 sm:p-6 rounded-2xl shadow-2xl border border-[#C99325]/40 max-w-xs">
                <div className="flex items-center gap-2 text-[#C99325] text-[10px] font-black uppercase tracking-[0.18em] mb-1.5">
                  <VerifiedUserIcon sx={{ fontSize: 16 }} />
                  <span>Legal & Title Assurance</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold leading-snug">
                  Every plot & residence audited with DTCP / RERA & Patta documentation upfront.
                </div>
              </div>
            </motion.div>

            {/* Right Typography-Led Narrative (6 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
                  The Grounds & Gates Philosophy
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18241B] tracking-tight leading-[1.15] mt-2">
                  Architectural clarity. Verified documentation.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Real estate in Tamil Nadu deserves an experience defined by calm precision rather than fragmented broker calls. Grounds and Gates unites our own signature company-developed estates with carefully vetted third-party properties—presenting clear road widths, utility infrastructure, and approval records side by side.
              </p>

              {/* Editorial Key Differences Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-stone-300/60">
                <div>
                  <div className="text-2xl font-black text-[#013E18]">Direct</div>
                  <div className="text-xs font-bold text-[#18241B] mt-1">Company Inventory</div>
                  <p className="text-[11px] text-stone-500 mt-1">Zero brokerage on signature Grounds & Gates layouts.</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#013E18]">Clear</div>
                  <div className="text-xs font-bold text-[#18241B] mt-1">Title Audit</div>
                  <p className="text-[11px] text-stone-500 mt-1">Upfront DTCP, CMDA, RERA & road width metrics.</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#013E18]">15 Min</div>
                  <div className="text-xs font-bold text-[#18241B] mt-1">Desk Response</div>
                  <p className="text-[11px] text-stone-500 mt-1">Dedicated site visit coordinators across 10 cities.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <ArchitecturalDivider />

      {/* ===================================================================== */}
      {/* 3. ASYMMETRIC BENTO COLLECTION SHOWCASE (CATEGORIES)                  */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
                Curated Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight mt-1">
                {t.categories.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md">
              {t.categories.subtitle}
            </p>
          </div>

          {/* Asymmetric Bento Layout: Top 2 Flagship Categories Larger, Next 4 Balanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {categoryList.map((category, index) => {
              const isLeadCategory = index < 2;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  onClick={() => onNavigate('properties', { category: category.id })}
                  className={`group relative rounded-3xl overflow-hidden bg-[#18241B] shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                    isLeadCategory ? 'lg:col-span-6 h-72 sm:h-84' : 'lg:col-span-3 h-64 sm:h-72'
                  }`}
                >
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001d0b]/95 via-[#001d0b]/35 to-transparent" />

                  {/* Top Corner Unit Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/50 backdrop-blur-md text-[#e0aa3e] border border-white/15">
                      {category.typicalUnits}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#C99325] transition-colors">
                      <ArrowForwardIcon sx={{ fontSize: 16, transform: 'rotate(-45deg)', transition: 'transform 0.3s' }} />
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute bottom-5 left-5 right-5 text-white z-10">
                    <h3 className={`${isLeadCategory ? 'text-2xl' : 'text-lg'} font-extrabold leading-tight group-hover:text-[#e0aa3e] transition-colors`}>
                      {lang === 'ta' ? category.tamilName : category.name}
                    </h3>
                    <p className="text-xs text-stone-300 line-clamp-2 mt-1.5 leading-relaxed opacity-90">
                      {lang === 'ta' ? category.tamilDescription : category.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. FEATURED PROPERTIES COLLECTION (LEAD FEATURED + GRID HIERARCHY)    */}
      {/* ===================================================================== */}
      <section className="py-20 sm:py-28 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#C99325] uppercase tracking-[0.2em] mb-2">
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                <span>Hand-Picked Tamil Nadu Portfolio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight">
                Featured Properties
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-xl">
                Distinctively structured across Grounds & Gates direct estates and verified private seller opportunities.
              </p>
            </div>

            {/* Animated Pill Tab Switcher */}
            <div className="inline-flex flex-wrap items-center gap-1 bg-[#FAF8F2] p-1.5 rounded-2xl border border-stone-200/80">
              {[
                { id: 'all', label: 'All Curated' },
                { id: 'company', label: 'G&G Direct' },
                { id: 'third-party', label: 'Verified Sellers' },
                { id: 'plots', label: 'Plots' },
                { id: 'villas', label: 'Villas' },
              ].map(tab => {
                const active = featuredTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (featuredTab !== tab.id) {
                        setIsFeaturedLoading(true);
                        setFeaturedTab(tab.id as any);
                        setTimeout(() => setIsFeaturedLoading(false), 240);
                      }
                    }}
                    className={`relative z-10 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-stone-600 hover:text-[#013E18]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="featured-filter-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 bg-[#013E18] rounded-xl shadow-xs -z-10"
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isFeaturedLoading ? (
            <PropertyGridSkeleton count={3} layout="grid" />
          ) : properties.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#FAF8F2] rounded-3xl border border-dashed border-stone-300">
              <div className="w-16 h-16 rounded-full bg-[#013E18]/10 text-[#013E18] flex items-center justify-center mx-auto mb-4">
                <AutoAwesomeIcon sx={{ fontSize: 28, color: '#C99325' }} />
              </div>
              <h3 className="text-lg font-bold text-[#18241B]">
                {lang === 'ta' ? 'புதிய சரிபார்க்கப்பட்ட சொத்துக்கள் சேர்க்கப்படுகின்றன' : 'Curating Verified Properties'}
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
                {lang === 'ta'
                  ? 'தற்போது புதிய நேரடி மனைகள் மற்றும் வில்லாக்கள் சரிபார்க்கப்பட்டு வருகின்றன. உங்களது சொத்தினை சந்தைப்படுத்த கீழே கிளிக் செய்யவும்.'
                  : 'New DTCP/CMDA verified land parcels and luxury homes are currently being verified by our advisory desk. Be the first to list with zero buyer brokerage.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => onNavigate('post-property')}
                  className="px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] shadow-md transition-all cursor-pointer"
                >
                  {lang === 'ta' ? 'சொத்து சேர்க்க' : 'Post a Property'}
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-white transition-all cursor-pointer"
                >
                  {lang === 'ta' ? 'ஆலோசகரைத் தொடர்புகொள்ள' : 'Connect with Advisory Desk'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Distinctive Featured Lead Listing in Horizontal Editorial Layout */}
              {leadSpotlightProperty && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#013E18] mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#C99325]" />
                    <span>Lead Featured Opportunity</span>
                  </div>
                  <PropertyCard
                    property={leadSpotlightProperty}
                    lang={lang}
                    isSaved={savedPropertyIds.includes(leadSpotlightProperty.id)}
                    onToggleSave={onToggleSave}
                    isCompared={comparedPropertyIds.includes(leadSpotlightProperty.id)}
                    onToggleCompare={onToggleCompare}
                    onSelect={onSelectProperty}
                    layout="list"
                  />
                </div>
              )}

              {/* Staggered Remaining Featured Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridFeaturedProperties.map(prop => (
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
            </div>
          )}

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('properties')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <span>Browse Full Collection ({properties.length} Properties)</span>
              <ArrowForwardIcon sx={{ fontSize: 16, color: '#C99325' }} />
            </button>
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. OVERLAPPING ARCHITECTURAL SPOTLIGHT BANNER                         */}
      {/* ===================================================================== */}
      <section className="py-20 sm:py-24 bg-[#FAF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#013E18] text-[#F5F2E9] rounded-3xl p-8 sm:p-14 border border-[#C99325]/40 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center overflow-hidden relative">
            {/* Subtle Ambient Gold Radial Accent */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C99325]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="lg:col-span-6 space-y-6 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#C99325] text-white text-[10px] font-black uppercase tracking-wider">
                  Signature Enclave
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-stone-200 text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  Grounds & Gates Direct
                </span>
                <span className="text-[11px] text-[#e0aa3e] font-semibold">
                  DTCP & RERA Approved
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                The Royal Gates: 4BHK Ultra-Luxury Smart Villa
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Architectural duplex estate on Avinashi Road, Coimbatore. Crafted with Italian marble flooring, 40ft blacktop frontage, solar infrastructure, and 100% Vaastu geometry.
              </p>

              {/* Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/15 text-xs">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Plot Area</div>
                  <div className="font-extrabold text-[#e0aa3e] text-base mt-0.5">8.5 Cents</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Built-Up</div>
                  <div className="font-extrabold text-white text-base mt-0.5">3,800 sq.ft</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Layout</div>
                  <div className="font-extrabold text-white text-base mt-0.5">4 BHK + Study</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Orientation</div>
                  <div className="font-extrabold text-[#e0aa3e] text-base mt-0.5">North-East</div>
                </div>
              </div>

              {/* Price & Magnetic Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div>
                  <div className="text-[11px] text-stone-400 uppercase font-bold">Fixed Corporate Price</div>
                  <div className="text-3xl font-black text-[#e0aa3e] tracking-tight">
                    ₹2.45 Crore
                  </div>
                </div>

                <button
                  onClick={() => onSelectProperty('gg-cbe-villa-01')}
                  className="px-6 py-3.5 rounded-xl bg-[#C99325] text-white hover:bg-[#b8831b] font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <span>Inspect Residence</span>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative z-10">
              <div
                onClick={() => onSelectProperty('gg-cbe-villa-01')}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-[#C99325]/40 group cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=90"
                  alt="The Royal Gates Ultra Luxury Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <LocationOnIcon sx={{ fontSize: 14, color: '#C99325' }} />
                    Avinashi Road, Coimbatore
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#013E18]/90 text-[#e0aa3e] text-[10px] border border-[#C99325]/30 backdrop-blur-md">
                    Ready to Move
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. TAMIL NADU DISCOVERY EXPERIENCE (MOSAIC + INTERACTIVE MAP)         */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F5F2E9] border-t border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
                  Regional Growth Corridors
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight mt-1">
                  {t.locations.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md">
                {t.locations.subtitle}
              </p>
            </div>

            {/* Distinct Regional Visual Mosaic: 2 Metro Anchors + 8 Regional Corridors */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {locationList.map((loc, idx) => {
                const isMetroAnchor = idx < 2;
                return (
                  <motion.div
                    key={loc.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.45, delay: idx * 0.04 }}
                    onClick={() => onNavigate('properties', { district: loc.name })}
                    className={`group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-stone-300/60 cursor-pointer transition-all duration-500 ${
                      isMetroAnchor ? 'col-span-2 lg:col-span-3 h-56 sm:h-64' : 'col-span-1 lg:col-span-1 h-48 sm:h-52'
                    }`}
                  >
                    <img
                      src={loc.imageUrl}
                      alt={loc.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-[#e0aa3e] border border-white/15">
                        {loc.listingCount} Estates
                      </span>
                    </div>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
                      <div className={`${isMetroAnchor ? 'text-xl' : 'text-sm'} font-extrabold leading-tight group-hover:text-[#e0aa3e] transition-colors`}>
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-stone-300 font-normal mt-0.5">
                        {loc.tamilName}
                      </div>
                      {isMetroAnchor && (
                        <p className="text-[11px] text-stone-300/90 line-clamp-1 mt-1 hidden sm:block">
                          {loc.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <ArchitecturalDivider />

          {/* Interactive Geographic Corridor Explorer */}
          <InteractiveDiscoveryMap
            properties={properties}
            lang={lang}
            onNavigate={onNavigate}
            onSelectProperty={onSelectProperty}
          />

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. HOW IT WORKS (ARCHITECTURAL STEP TIMELINE)                         */}
      {/* ===================================================================== */}
      <section className="py-20 sm:py-28 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
              Structured Decision Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight mt-1">
              {t.howItWorks.title}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600">
              {t.howItWorks.subtitle}
            </p>

            {/* Buyer / Seller Animated Switcher */}
            <div className="inline-flex rounded-xl border border-stone-200 bg-[#FAF8F2] p-1 mt-6">
              {(['buyer', 'seller'] as const).map((tab) => {
                const isActive = journeyTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setJourneyTab(tab)}
                    className={`relative z-10 px-6 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isActive ? 'text-white' : 'text-stone-600 hover:text-[#013E18]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="journey-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-[#013E18] rounded-lg shadow-xs -z-10"
                      />
                    )}
                    {tab === 'buyer' ? t.howItWorks.buyerTab : t.howItWorks.sellerTab}
                  </button>
                );
              })}
            </div>
          </div>

          {journeyTab === 'buyer' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {[
                { num: '01', title: t.howItWorks.buyerStep1Title, desc: t.howItWorks.buyerStep1Desc },
                { num: '02', title: t.howItWorks.buyerStep2Title, desc: t.howItWorks.buyerStep2Desc },
                { num: '03', title: t.howItWorks.buyerStep3Title, desc: t.howItWorks.buyerStep3Desc },
                { num: '04', title: t.howItWorks.buyerStep4Title, desc: t.howItWorks.buyerStep4Desc },
                { num: '05', title: t.howItWorks.buyerStep5Title, desc: t.howItWorks.buyerStep5Desc },
              ].map((step) => (
                <div key={step.num} className="relative pt-4 border-t-2 border-[#013E18]/15 hover:border-[#C99325] transition-colors">
                  <div className="text-xs font-black text-[#C99325] tracking-widest mb-2">
                    STEP {step.num}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#18241B]">{step.title}</h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                { num: '01', title: t.howItWorks.sellerStep1Title, desc: t.howItWorks.sellerStep1Desc },
                { num: '02', title: t.howItWorks.sellerStep2Title, desc: t.howItWorks.sellerStep2Desc },
                { num: '03', title: t.howItWorks.sellerStep3Title, desc: t.howItWorks.sellerStep3Desc },
                { num: '04', title: t.howItWorks.sellerStep4Title, desc: t.howItWorks.sellerStep4Desc },
              ].map((step) => (
                <div key={step.num} className="relative pt-4 border-t-2 border-[#C99325]/25 hover:border-[#013E18] transition-colors">
                  <div className="text-xs font-black text-[#013E18] tracking-widest mb-2">
                    PHASE {step.num}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#18241B]">{step.title}</h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. FINANCIAL TRANSPARENCY & WHY GROUNDS AND GATES                     */}
      {/* ===================================================================== */}
      <section className="py-20 bg-[#FAF8F2] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Why Us Minimal Architectural Pillars */}
          <div>
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
                Marketplace Integrity
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight mt-1">
                {t.whyUs.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: DescriptionIcon, title: t.whyUs.item1Title, desc: t.whyUs.item1Desc },
                { icon: VerifiedUserIcon, title: t.whyUs.item2Title, desc: t.whyUs.item2Desc },
                { icon: TrendingUpIcon, title: t.whyUs.item3Title, desc: t.whyUs.item3Desc },
                { icon: ExploreIcon, title: t.whyUs.item4Title, desc: t.whyUs.item4Desc },
                { icon: PeopleIcon, title: t.whyUs.item5Title, desc: t.whyUs.item5Desc },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs hover:border-[#C99325]/50 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#013E18] text-[#C99325] flex items-center justify-center mb-4">
                      <Icon sx={{ fontSize: 20 }} />
                    </div>
                    <h3 className="font-bold text-sm text-[#18241B]">{item.title}</h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <ArchitecturalDivider />

          {/* EMI Calculator */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
                {lang === 'ta' ? 'நிதித் திட்டமிடல்' : 'Financial Clarity'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] mt-1">
                Plan Your Property Acquisition Confidently
              </h2>
            </div>

            <EmiCalculator initialPrice={4500000} lang={lang} />
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 10. CLOSING ARCHITECTURAL CTA BANNER                                  */}
      {/* ===================================================================== */}
      <section className="relative bg-[#013E18] text-[#F5F2E9] py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C99325] block mb-3">
            Grounds & Gates
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.cta.headline}
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed">
            {t.cta.subtext}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('properties')}
              className="px-7 py-4 rounded-2xl bg-[#C99325] hover:bg-[#b8831b] text-white font-extrabold text-sm shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{t.cta.exploreBtn}</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
            <button
              onClick={() => onNavigate('post-property')}
              className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#F5F2E9] border border-white/30 font-extrabold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <AddCircleIcon sx={{ fontSize: 16, color: '#C99325' }} />
              <span>{t.cta.postBtn}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
