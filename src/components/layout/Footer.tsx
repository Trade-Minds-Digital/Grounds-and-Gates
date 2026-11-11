import React from 'react';
import { Logo } from '../common/Logo';
import { translations } from '../../i18n/translations';
import { LanguageCode } from '../../types/property';
import { LOCATIONS_DATA } from '../../data/locations';
import { CATEGORIES_DATA } from '../../data/categories';
import { Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigate,
  onLanguageChange,
}) => {
  const t = translations[lang];

  return (
    <footer className="bg-[#18241B] text-[#F5F2E9] pt-16 pb-12 border-t-4 border-[#C99325]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo variant="light" size="lg" />
            
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-md mt-2">
              {t.footer.about}
            </p>

            <div className="flex flex-col gap-2 mt-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C99325] shrink-0" />
                <span>Grounds & Gates Towers, Avinashi Road, Coimbatore, Tamil Nadu 641014</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C99325] shrink-0" />
                <a href="tel:+914222987000" className="hover:text-white transition-colors">
                  +91 422 298 7000 (Direct Desk)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C99325] shrink-0" />
                <a href="mailto:direct@groundsandgates.com" className="hover:text-white transition-colors">
                  direct@groundsandgates.com
                </a>
              </div>
            </div>

            {/* Language Switcher in Footer */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-stone-400 font-semibold">{t.nav.language}:</span>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs rounded font-bold cursor-pointer transition-colors ${
                  lang === 'en' ? 'bg-[#C99325] text-white' : 'bg-white/10 text-stone-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onLanguageChange('ta')}
                className={`px-2.5 py-1 text-xs rounded font-bold cursor-pointer transition-colors ${
                  lang === 'ta' ? 'bg-[#C99325] text-white' : 'bg-white/10 text-stone-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#C99325] mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { listingType: 'buy' })}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.buy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { listingType: 'rent' })}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.rent}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('post-property')}
                  className="hover:text-[#C99325] hover:underline transition-colors font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.nav.postProperty}</span>
                  <span className="text-[10px] bg-[#C99325] text-white px-1.5 py-0.2 rounded font-semibold">Free</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compare')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.compare}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.saved}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('buyer-dashboard')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.buyerDashboard}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('seller-dashboard')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {t.nav.sellerDashboard}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {lang === 'ta' ? 'எங்களைப் பற்றி (About Us)' : 'About Grounds & Gates'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  {lang === 'ta' ? 'தொடர்புக்கு (Contact Us)' : 'Contact Corporate Desk'}
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#C99325] mb-4">
              {t.footer.categories}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              {CATEGORIES_DATA.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('properties', { category: cat.id })}
                    className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {lang === 'ta' ? cat.tamilName : cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Regional Hubs */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#C99325] mb-4">
              {t.footer.regionalHubs}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              {LOCATIONS_DATA.slice(0, 7).map(loc => (
                <li key={loc.id}>
                  <button
                    onClick={() => onNavigate('properties', { district: loc.name })}
                    className="hover:text-white hover:underline transition-colors flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>{loc.name}</span>
                    <span className="text-[10px] text-stone-400">({loc.listingCount})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Demo Disclaimer & Copyright Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2 text-center md:text-left">
            <ShieldCheck className="w-4 h-4 text-[#C99325] shrink-0" />
            <p className="text-[11px] leading-relaxed max-w-3xl">
              <strong className="text-stone-200">Presentation Disclaimer: </strong>
              {t.footer.disclaimer}
            </p>
          </div>

          <div className="text-[11px] shrink-0">
            {t.footer.copyright}
          </div>
        </div>

      </div>
    </footer>
  );
};
