import React, { useState } from 'react';
import { Property, LanguageCode } from '../../types/property';
import { Badge } from '../common/Badge';
import { formatPriceINR, formatArea } from '../../utils/propertyUtils';
import { translations } from '../../i18n/translations';
import {
  MapPin,
  Heart,
  Scale,
  Compass,
  Bed,
  Maximize2,
  Building,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  lang: LanguageCode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onSelect: (id: string) => void;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  lang,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onSelect,
  layout = 'grid'
}) => {
  const t = translations[lang];
  const [imageError, setImageError] = useState(false);
  const [isHeartBouncing, setIsHeartBouncing] = useState(false);

  const title = lang === 'ta' && property.tamilTitle ? property.tamilTitle : property.title;
  const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  const displayImage = imageError || !property.images?.length ? fallbackImage : property.images[0];

  const formattedPrice = formatPriceINR(property.price, property.listingType, property.priceUnit);
  const formattedAreaText = formatArea(property.plotArea, property.plotAreaUnit, property.builtUpArea);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartBouncing(true);
    setTimeout(() => setIsHeartBouncing(false), 400);
    onToggleSave(property.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompare(property.id);
  };

  const isCompanyOwned = property.ownershipType === 'company';

  // ----------------------------------------------------
  // LIST VIEW LAYOUT (Horizontal Editorial Format)
  // ----------------------------------------------------
  if (layout === 'list') {
    return (
      <div
        onClick={() => onSelect(property.id)}
        className={`group bg-white rounded-2xl sm:rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col md:flex-row cursor-pointer ${
          property.featured
            ? 'border-[#C99325]/50 shadow-md hover:shadow-2xl hover:border-[#C99325]'
            : 'border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#013E18]/40'
        }`}
      >
        {/* Left Image Area */}
        <div className="relative md:w-84 lg:w-96 h-60 md:h-auto shrink-0 overflow-hidden bg-stone-100">
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 pointer-events-none" />

          {/* Top Left Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
            <Badge type="demo" size="sm" />
            {property.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C99325] text-white shadow-md">
                <Sparkles className="w-2.5 h-2.5" />
                Featured
              </span>
            )}
            {isCompanyOwned ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#013E18] text-white border border-emerald-400/30 shadow-md">
                <ShieldCheck className="w-2.5 h-2.5 text-[#C99325]" />
                Direct
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-stone-200 border border-white/20">
                Verified Seller
              </span>
            )}
          </div>

          {/* Top Right Action Pills */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
            <button
              onClick={handleHeartClick}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
                isSaved
                  ? 'bg-rose-500 text-white shadow-lg scale-105'
                  : 'bg-black/40 text-white hover:bg-black/70 hover:scale-105'
              } ${isHeartBouncing ? 'animate-bounce' : ''}`}
              title={isSaved ? t.card.saved : t.card.save}
              aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCompareClick}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
                isCompared
                  ? 'bg-[#C99325] text-white shadow-lg scale-105'
                  : 'bg-black/40 text-white hover:bg-black/70 hover:scale-105'
              }`}
              title={t.card.compare}
              aria-label={`Compare ${title}`}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Pill: Listing Type */}
          <div className="absolute bottom-3.5 left-3.5 z-10">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-white/95 text-[#013E18] backdrop-blur-md shadow-xs">
              {property.listingType === 'buy' ? 'For Sale' : 'For Rent / Lease'}
            </span>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Category & Approval */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C99325]">
                {property.category.replace('-', ' ')}
              </span>
              {property.approvalAuthority && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#013E18] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-[#013E18]" />
                  {property.approvalAuthority} Approved
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-extrabold text-[#18241B] group-hover:text-[#013E18] transition-colors line-clamp-1 leading-snug">
              {title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C99325] shrink-0" />
              <span className="font-medium text-stone-700">{property.location}, {property.district}</span>
              {property.landmark && <span className="text-stone-400 font-normal">({property.landmark})</span>}
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 line-clamp-2 mt-2.5 leading-relaxed">
              {lang === 'ta' && property.tamilDescription ? property.tamilDescription : property.description}
            </p>

            {/* Architectural Specs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 mt-4 border-y border-stone-100 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#C99325] shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Plot Area</div>
                  <div className="font-extrabold text-[#18241B]">{formattedAreaText}</div>
                </div>
              </div>

              {property.builtUpArea && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C99325] shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Built Area</div>
                    <div className="font-extrabold text-[#18241B]">{property.builtUpArea} sq.ft</div>
                  </div>
                </div>
              )}

              {property.bedrooms != null ? (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#C99325] shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Config</div>
                    <div className="font-extrabold text-[#18241B]">{property.bedrooms} BHK</div>
                  </div>
                </div>
              ) : property.roadWidthFeet ? (
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C99325] shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Road Width</div>
                    <div className="font-extrabold text-[#18241B]">{property.roadWidthFeet} ft road</div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C99325] shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Facing</div>
                  <div className="font-extrabold text-[#18241B]">{property.facing}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Price & CTA */}
          <div className="flex items-center justify-between pt-4 mt-2">
            <div>
              <div className="text-2xl font-black text-[#013E18] tracking-tight">
                {formattedPrice}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                {property.negotiable ? 'Price Negotiable' : isCompanyOwned ? 'Guaranteed Direct Price' : 'Fixed Quoted Price'}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property.id);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer group/btn"
            >
              <span>{t.card.viewDetails}</span>
              <ArrowRight className="w-4 h-4 text-[#C99325] transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // GRID VIEW LAYOUT (Editorial Magazine Vertical Format)
  // ----------------------------------------------------
  return (
    <div
      onClick={() => onSelect(property.id)}
      className={`group bg-white rounded-2xl sm:rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer ${
        property.featured
          ? 'border-[#C99325]/50 shadow-md hover:shadow-2xl hover:border-[#C99325]'
          : 'border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#013E18]/40'
      }`}
    >
      {/* Top Image Showcase */}
      <div className="relative aspect-16/10 sm:aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Left Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <Badge type="demo" size="sm" />
          {property.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C99325] text-white shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>

        {/* Top Right Quick Actions */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
          <button
            onClick={handleHeartClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
              isSaved
                ? 'bg-rose-500 text-white shadow-lg scale-105'
                : 'bg-black/40 text-white hover:bg-black/70 hover:scale-105'
            } ${isHeartBouncing ? 'animate-bounce' : ''}`}
            title={isSaved ? t.card.saved : t.card.save}
            aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleCompareClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
              isCompared
                ? 'bg-[#C99325] text-white shadow-lg scale-105'
                : 'bg-black/40 text-white hover:bg-black/70 hover:scale-105'
            }`}
            title={t.card.compare}
            aria-label={`Compare ${title}`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Image Overlay: Ownership & Listing Type */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          {isCompanyOwned ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#013E18] text-white border border-emerald-400/30 shadow-md">
              <ShieldCheck className="w-2.5 h-2.5 text-[#C99325]" />
              Direct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-stone-200 border border-white/20">
              Verified Seller
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-white/95 text-[#013E18] backdrop-blur-md shadow-xs">
            {property.listingType === 'buy' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location Header */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C99325]">
              {property.category.replace('-', ' ')}
            </span>
            {property.approvalAuthority && (
              <span className="text-[10px] font-bold text-[#013E18] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {property.approvalAuthority}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-[#18241B] group-hover:text-[#013E18] transition-colors line-clamp-1 mb-1 leading-snug">
            {title}
          </h3>

          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#C99325] shrink-0" />
            <span className="truncate font-medium text-stone-700">{property.location}, {property.district}</span>
          </div>

          {/* Architectural Metric Pill */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#FAF8F2] rounded-xl text-xs text-stone-700 mb-4 border border-stone-200/60">
            <div className="flex flex-col">
              <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">Area</span>
              <span className="font-extrabold text-[#18241B] truncate">{property.plotArea} {property.plotAreaUnit}</span>
            </div>

            {property.bedrooms != null ? (
              <div className="flex flex-col border-x border-stone-200/80 px-2">
                <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">Beds</span>
                <span className="font-extrabold text-[#18241B] truncate">{property.bedrooms} BHK</span>
              </div>
            ) : property.roadWidthFeet ? (
              <div className="flex flex-col border-x border-stone-200/80 px-2">
                <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">Road</span>
                <span className="font-extrabold text-[#18241B] truncate">{property.roadWidthFeet} ft</span>
              </div>
            ) : (
              <div className="flex flex-col border-x border-stone-200/80 px-2">
                <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">Type</span>
                <span className="font-extrabold text-[#18241B] capitalize truncate">{property.category.split('-')[0]}</span>
              </div>
            )}

            <div className="flex flex-col pl-1">
              <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">Facing</span>
              <span className="font-extrabold text-[#18241B] truncate">{property.facing}</span>
            </div>
          </div>
        </div>

        {/* Bottom Price & View Details CTA */}
        <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-[#013E18] tracking-tight">
              {formattedPrice}
            </div>
            <div className="text-[10px] text-stone-400 font-medium">
              {property.negotiable ? 'Negotiable' : isCompanyOwned ? 'Corporate Direct' : 'Verified Price'}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property.id);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer group/btn"
          >
            <span>{t.card.viewDetails}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C99325] transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
