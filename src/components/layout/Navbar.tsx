import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { translations } from '../../i18n/translations';
import { LanguageCode, UserRole } from '../../types/property';
import { LOCATIONS_DATA } from '../../data/locations';
import {
  MapPin,
  Globe,
  Heart,
  Scale,
  PlusCircle,
  Menu,
  X,
  User,
  ChevronDown,
  Building,
  KeyRound,
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  savedCount: number;
  compareCount: number;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  lang,
  onLanguageChange,
  savedCount,
  compareCount,
  selectedLocation,
  onLocationChange,
  userRole,
  onUserRoleChange,
  onOpenAuth,
  isLoggedIn,
  onLogout,
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'buy', label: t.nav.buy, filter: { listingType: 'buy' } },
    { id: 'rent', label: t.nav.rent, filter: { listingType: 'rent' } },
    { id: 'commercial', label: t.nav.commercial, filter: { category: 'commercial-properties' } },
    { id: 'about', label: lang === 'ta' ? 'எங்களைப் பற்றி' : 'About' },
    { id: 'contact', label: lang === 'ta' ? 'தொடர்புக்கு' : 'Contact' },
  ];

  const handleLinkClick = (id: string, filter?: any) => {
    setMobileMenuOpen(false);
    if (id === 'home') {
      onNavigate('home');
    } else if (id === 'buy' || id === 'rent' || id === 'commercial') {
      onNavigate('properties', filter);
    } else if (id === 'about') {
      onNavigate('about');
    } else if (id === 'contact') {
      onNavigate('contact');
    } else {
      onNavigate(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#18241B]/10 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Location Selector */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 shrink-0">
            <button
              onClick={() => handleLinkClick('home')}
              className="text-left focus:outline-hidden cursor-pointer shrink-0"
              aria-label="Grounds and Gates Home"
            >
              <Logo variant="horizontal" size="md" className="shrink-0" />
            </button>

            {/* Location Selector (Desktop) */}
            <div className="relative hidden xl:block shrink-0">
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#18241B]/15 bg-[#F5F2E9] hover:bg-[#ede9dc] text-xs font-semibold text-[#18241B] transition-colors cursor-pointer shrink-0"
                aria-label="Choose target district or city"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C99325]" />
                <span className="truncate max-w-[130px]">
                  {selectedLocation === 'All' ? (lang === 'ta' ? 'அனைத்து தமிழகம்' : 'All Tamil Nadu') : selectedLocation}
                </span>
                <ChevronDown className="w-3 h-3 text-[#536458]" />
              </button>

              {locationDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLocationDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-20 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {lang === 'ta' ? 'முக்கிய நகரங்கள்' : 'Target Hubs'}
                    </div>
                    <button
                      onClick={() => {
                        onLocationChange('All');
                        setLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#F5F2E9] transition-colors ${
                        selectedLocation === 'All' ? 'text-[#013E18] bg-[#F5F2E9]' : 'text-stone-700'
                      }`}
                    >
                      <span>{lang === 'ta' ? 'அனைத்து தமிழ்நாடு' : 'All Tamil Nadu'}</span>
                      <span className="text-[10px] text-stone-400">32 Listings</span>
                    </button>
                    {LOCATIONS_DATA.map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onLocationChange(loc.name);
                          setLocationDropdownOpen(false);
                          onNavigate('properties', { district: loc.name });
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F5F2E9] transition-colors ${
                          selectedLocation === loc.name ? 'text-[#013E18] font-bold bg-[#F5F2E9]' : 'text-stone-700'
                        }`}
                      >
                        <div>
                          <span>{loc.name}</span>
                          <span className="text-[10px] text-stone-400 ml-1.5 font-normal">({loc.tamilName})</span>
                        </div>
                        <span className="text-[10px] text-[#C99325] font-semibold">{loc.listingCount}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Middle: Primary Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {navLinks.map(link => {
              const isActive =
                (link.id === 'home' && currentView === 'home') ||
                (link.id === 'buy' && currentView === 'properties' && link.filter?.listingType === 'buy') ||
                (link.id === 'rent' && currentView === 'properties' && link.filter?.listingType === 'rent') ||
                (link.id === 'commercial' && currentView === 'properties' && link.filter?.category === 'commercial-properties');

              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.filter)}
                  className={`px-2.5 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#013E18] bg-[#013E18]/8 font-bold'
                      : 'text-[#18241B] hover:text-[#013E18] hover:bg-stone-100/70'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions, Badges, Language, Profile & Post Property */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-bold">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#013E18] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('ta')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  lang === 'ta'
                    ? 'bg-[#013E18] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-label="தமிழுக்கு மாறவும்"
              >
                தமிழ்
              </button>
            </div>

            {/* Compare Badge / Link */}
            <button
              onClick={() => onNavigate('compare')}
              className="relative p-2 rounded-lg text-stone-700 hover:text-[#013E18] hover:bg-stone-100 transition-colors cursor-pointer"
              title="Compare Properties"
              aria-label={`Compare ${compareCount} properties`}
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C99325] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Saved / Favorites Badge */}
            <button
              onClick={() => onNavigate('favorites')}
              className="relative p-2 rounded-lg text-stone-700 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Saved Properties"
              aria-label={`View ${savedCount} saved properties`}
            >
              <Heart className={`w-5 h-5 ${savedCount > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Post Property Button (Prominent CTA) */}
            <button
              onClick={() => onNavigate('post-property')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C99325]" />
              <span>{t.nav.postProperty}</span>
            </button>

            {/* User Profile / Portal Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                aria-label="User portal and demo profiles"
              >
                <div className="w-6 h-6 rounded-full bg-[#013E18]/10 text-[#013E18] flex items-center justify-center font-bold text-xs">
                  <User className="w-3.5 h-3.5 text-[#013E18]" />
                </div>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Demo Mode Portals
                      </div>
                      <div className="text-xs font-bold text-[#18241B] mt-0.5">
                        {userRole === 'buyer' ? 'Logged in as Buyer' : 'Logged in as Property Owner'}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('buyer-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#F5F2E9] hover:text-[#013E18] flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#C99325]" />
                          {t.nav.buyerDashboard}
                        </span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">Buyer</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('seller-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#F5F2E9] hover:text-[#013E18] flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#013E18]" />
                          {t.nav.sellerDashboard}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Seller</span>
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <div className="px-4 py-1 text-[10px] font-medium text-stone-400 uppercase">
                        Switch Active Demo Role
                      </div>
                      <div className="grid grid-cols-2 gap-1 px-3 py-1">
                        <button
                          onClick={() => {
                            onUserRoleChange('buyer');
                            setUserDropdownOpen(false);
                          }}
                          className={`text-center py-1 text-xs rounded font-bold ${
                            userRole === 'buyer'
                              ? 'bg-[#013E18] text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          Buyer Mode
                        </button>
                        <button
                          onClick={() => {
                            onUserRoleChange('owner');
                            setUserDropdownOpen(false);
                          }}
                          className={`text-center py-1 text-xs rounded font-bold ${
                            userRole === 'owner'
                              ? 'bg-[#C99325] text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          Seller Mode
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAuth('login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-2 mt-1"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                        <span>Sign In / Register Modal</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 cursor-pointer"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Location Selector Mobile */}
          <div className="mb-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              {lang === 'ta' ? 'இருப்பிடம்' : 'Target Location'}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => {
                onLocationChange(e.target.value);
                setMobileMenuOpen(false);
                if (e.target.value !== 'All') {
                  onNavigate('properties', { district: e.target.value });
                }
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-200 bg-[#F5F2E9] text-[#18241B]"
            >
              <option value="All">{lang === 'ta' ? 'அனைத்து தமிழ்நாடு (32 சொத்துக்கள்)' : 'All Tamil Nadu (32 Listings)'}</option>
              {LOCATIONS_DATA.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} ({loc.tamilName}) - {loc.listingCount} listings
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.filter)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-stone-800 hover:bg-[#F5F2E9] hover:text-[#013E18]"
              >
                {link.label}
              </button>
            ))}

            <div className="border-t border-stone-100 my-2 pt-2 flex flex-col gap-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('post-property');
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-[#013E18] text-[#F5F2E9] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#C99325]" />
                  {t.nav.postProperty}
                </span>
                <span className="text-[10px] bg-[#C99325] text-white px-2 py-0.5 rounded font-bold uppercase">
                  Free
                </span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('buyer-dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-[#F5F2E9] flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#C99325]" />
                {t.nav.buyerDashboard}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('seller-dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-[#F5F2E9] flex items-center gap-2"
              >
                <Building className="w-4 h-4 text-[#013E18]" />
                {t.nav.sellerDashboard}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
