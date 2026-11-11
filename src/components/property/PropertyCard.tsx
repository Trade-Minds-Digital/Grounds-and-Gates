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
  Bath,
  Maximize2,
  Building,
  ArrowRight,
  ShieldCheck,
  Check
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
  const title = lang === 'ta' && property.tamilTitle ? property.tamilTitle : property.title;

  const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  const displayImage = imageError || !property.images?.length ? fallbackImage : property.images[0];

  const formattedPrice = formatPriceINR(property.price, property.listingType, property.priceUnit);
  const formattedAreaText = formatArea(property.plotArea, property.plotAreaUnit, property.builtUpArea);

  if (layout === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-[#013E18]/30 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
        {/* Image & Badges */}
        <div className="relative md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-stone-100">
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <Badge type="demo" size="sm" />
            {property.featured && <Badge type="featured" size="sm" />}
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(property.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isSaved
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title={isSaved ? t.card.saved : t.card.save}
              aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(property.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isCompared
                  ? 'bg-[#C99325] text-white shadow-md'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title={t.card.compare}
              aria-label={`Compare ${title}`}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Overlay: Ownership */}
          <div className="absolute bottom-3 left-3 z-10">
            {property.ownershipType === 'company' ? (
              <Badge type="company" size="sm" />
            ) : (
              <Badge type="third-party" label={property.seller.badgeTitle || t.card.thirdParty} size="sm" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99325]">
                {property.category.replace('-', ' ')}
              </span>
              <span className="text-xs text-stone-400 font-medium">
                {property.approvalAuthority ? `${property.approvalAuthority} Approved` : ''}
              </span>
            </div>

            <h3
              onClick={() => onSelect(property.id)}
              className="text-lg font-bold text-[#18241B] hover:text-[#013E18] transition-colors cursor-pointer line-clamp-1"
            >
              {title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#C99325] shrink-0" />
              <span>{property.location}, {property.district}</span>
              {property.landmark && <span className="text-stone-400">({property.landmark})</span>}
            </div>

            <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
              {lang === 'ta' && property.tamilDescription ? property.tamilDescription : property.description}
            </p>

            {/* Spec Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 mt-2 border-y border-stone-100 text-xs text-stone-700">
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold">{formattedAreaText}</span>
              </div>
              {property.builtUpArea && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  <span>{property.builtUpArea} sq.ft built</span>
                </div>
              )}
              {property.bedrooms != null && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-stone-400" />
                  <span>{property.bedrooms} {t.card.bhk}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>{property.facing} {t.card.facing}</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Price & CTA */}
          <div className="flex items-center justify-between pt-4 mt-2">
            <div>
              <div className="text-xl font-extrabold text-[#013E18]">
                {formattedPrice}
              </div>
              <div className="text-[11px] text-stone-500">
                {property.negotiable ? 'Price Negotiable' : 'Fixed Corporate Pricing'}
              </div>
            </div>

            <button
              onClick={() => onSelect(property.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>{t.card.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C99325]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Layout
  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#013E18]/30 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Image Section */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge type="demo" size="sm" />
          {property.featured && <Badge type="featured" size="sm" />}
        </div>

        {/* Actions (Heart & Compare) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isSaved ? t.card.saved : t.card.save}
            aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isCompared
                ? 'bg-[#C99325] text-white shadow-md'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={t.card.compare}
            aria-label={`Compare ${title}`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Image Overlay: Ownership & Category */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          {property.ownershipType === 'company' ? (
            <Badge type="company" size="sm" />
          ) : (
            <Badge type="third-party" label={property.seller.badgeTitle || t.card.thirdParty} size="sm" />
          )}

          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/90 text-[#18241B] backdrop-blur-xs uppercase">
            {property.listingType === 'buy' ? t.filters.buy : t.filters.rent}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Authority */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <div className="flex items-center gap-1 truncate max-w-[190px]">
              <MapPin className="w-3.5 h-3.5 text-[#C99325] shrink-0" />
              <span className="truncate">{property.location}, {property.district}</span>
            </div>
            {property.approvalAuthority && (
              <span className="text-[11px] font-semibold text-[#013E18] bg-[#013E18]/10 px-1.5 py-0.5 rounded">
                {property.approvalAuthority}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property.id)}
            className="text-base font-bold text-[#18241B] hover:text-[#013E18] transition-colors cursor-pointer line-clamp-1 mb-2"
          >
            {title}
          </h3>

          {/* Key Specs Row */}
          <div className="flex items-center justify-between py-2.5 px-3 bg-[#F5F2E9]/60 rounded-xl text-xs text-stone-700 mb-3 border border-stone-200/50">
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Area</span>
              <span className="font-bold text-[#18241B]">{property.plotArea} {property.plotAreaUnit}</span>
            </div>

            {property.bedrooms != null ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Config</span>
                <span className="font-bold text-[#18241B]">{property.bedrooms} BHK</span>
              </div>
            ) : property.roadWidthFeet ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Road</span>
                <span className="font-bold text-[#18241B]">{property.roadWidthFeet} ft</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Type</span>
                <span className="font-bold text-[#18241B] capitalize">{property.category.split('-')[0]}</span>
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Facing</span>
              <span className="font-bold text-[#18241B]">{property.facing}</span>
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-[#013E18] tracking-tight">
              {formattedPrice}
            </div>
            <div className="text-[10px] text-stone-400 font-medium">
              {property.negotiable ? 'Negotiable' : 'Fixed Direct Rate'}
            </div>
          </div>

          <button
            onClick={() => onSelect(property.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>{t.card.viewDetails}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C99325]" />
          </button>
        </div>
      </div>
    </div>
  );
};
