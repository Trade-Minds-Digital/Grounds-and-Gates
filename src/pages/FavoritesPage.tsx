import React from 'react';
import { Property, LanguageCode } from '../types/property';
import { PropertyCard } from '../components/property/PropertyCard';
import { translations } from '../i18n/translations';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';

interface FavoritesPageProps {
  savedProperties: Property[];
  lang: LanguageCode;
  onToggleSave: (id: string) => void;
  comparedPropertyIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
  onClearAll: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  savedProperties,
  lang,
  onToggleSave,
  comparedPropertyIds,
  onToggleCompare,
  onSelectProperty,
  onNavigate,
  onClearAll
}) => {
  const t = translations[lang];

  if (savedProperties.length === 0) {
    return (
      <div className="bg-[#FAF8F2] min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-stone-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#18241B]">{t.favorites.emptyTitle}</h2>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            {t.favorites.emptySubtitle}
          </p>

          <button
            onClick={() => onNavigate('properties')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] shadow-md transition-all cursor-pointer"
          >
            {t.favorites.browseCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Shortlisted Listings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight">
              {t.favorites.title} ({savedProperties.length})
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.favorites.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              {t.favorites.clearAll}
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className="px-4 py-2 rounded-xl bg-[#013E18] text-[#F5F2E9] text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Compare Selected ({comparedPropertyIds.length})
            </button>
          </div>
        </div>

        {/* Saved Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              lang={lang}
              isSaved={true}
              onToggleSave={onToggleSave}
              isCompared={comparedPropertyIds.includes(prop.id)}
              onToggleCompare={onToggleCompare}
              onSelect={onSelectProperty}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
