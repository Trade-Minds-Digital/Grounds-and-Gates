import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, LanguageCode } from '../types/property';
import { formatPriceINR, formatArea } from '../utils/propertyUtils';
import { translations } from '../i18n/translations';
import { Badge } from '../components/common/Badge';
import { PropertyCard } from '../components/property/PropertyCard';
import { EmiCalculator } from '../components/calculator/EmiCalculator';
import {
  ArrowLeft,
  MapPin,
  Heart,
  Scale,
  Share2,
  Calendar,
  Building2,
  ShieldCheck,
  Check,
  Maximize2,
  Compass,
  Bed,
  Bath,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Droplets,
  Zap,
  Building,
  Navigation,
  CheckCircle2,
  X,
  ChevronLeft,
  Printer,
  FileText
} from 'lucide-react';

interface PropertyDetailsPageProps {
  property: Property;
  allProperties: Property[];
  lang: LanguageCode;
  onBack: () => void;
  isSaved: boolean;
  savedPropertyIds?: string[];
  onToggleSave: (id: string) => void;
  isCompared: boolean;
  comparedPropertyIds?: string[];
  onToggleCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
  onOpenEnquiry: () => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  property,
  allProperties,
  lang,
  onBack,
  isSaved,
  savedPropertyIds = [],
  onToggleSave,
  isCompared,
  comparedPropertyIds = [],
  onToggleCompare,
  onSelectProperty,
  onOpenEnquiry
}) => {
  const t = translations[lang];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);

  const title = lang === 'ta' && property.tamilTitle ? property.tamilTitle : property.title;
  const description = lang === 'ta' && property.tamilDescription ? property.tamilDescription : property.description;

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'];

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [property.id]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      if (e.key === 'ArrowLeft') setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, images.length]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  // Similar properties in same category or district
  const similarProperties = allProperties
    .filter(p => p.id !== property.id && (p.district === property.district || p.category === property.category))
    .slice(0, 3);

  return (
    <div className="bg-[#FAF8F2] min-h-screen pb-16">
      
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#013E18] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C99325]" />
          <span>{t.propertyDetails.copiedToClipboard}</span>
        </div>
      )}

      {/* Breadcrumbs & Navigation Header */}
      <div className="bg-white border-b border-stone-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#013E18] hover:text-[#C99325] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.propertyDetails.backToListings}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBrochureOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:text-[#013E18] hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Download / Print Property Brochure"
              aria-label="Download property brochure"
            >
              <FileText className="w-4 h-4 text-[#C99325]" />
              <span className="hidden sm:inline">Brochure</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-[#013E18] hover:bg-stone-50 transition-colors cursor-pointer"
              title={t.propertyDetails.shareProperty}
              aria-label="Share property link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleCompare(property.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isCompared
                  ? 'border-[#C99325] bg-[#C99325] text-white'
                  : 'border-stone-200 text-stone-600 hover:text-[#013E18] hover:bg-stone-50'
              }`}
              title={t.card.compare}
              aria-label="Compare property"
            >
              <Scale className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleSave(property.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'border-rose-500 bg-rose-50 text-rose-600'
                  : 'border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-stone-50'
              }`}
              title={isSaved ? t.card.saved : t.card.save}
              aria-label="Save property to favorites"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-8">
        
        {/* Full-Width Luxury Architectural Gallery Mosaic */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/90 shadow-sm overflow-hidden mb-8"
        >
          <div className={`grid grid-cols-1 ${images.length > 1 ? 'md:grid-cols-12' : ''} gap-3`}>
            {/* Primary Hero Architectural Frame */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className={`relative ${images.length > 1 ? 'md:col-span-8' : ''} h-72 sm:h-96 md:h-[480px] rounded-2xl overflow-hidden bg-stone-100 cursor-zoom-in group`}
            >
              <img
                src={images[selectedImageIndex]}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />

              {/* Top Editorial Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge type="demo" size="md" />
                {property.ownershipType === 'company' ? (
                  <Badge type="company" size="md" />
                ) : (
                  <Badge type="third-party" label={property.seller.badgeTitle} size="md" />
                )}
                {property.featured && <Badge type="featured" size="md" />}
              </div>

              {/* Fullscreen Immersive Viewer Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-4 left-4 bg-black/65 hover:bg-black/85 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-lg border border-white/15"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#C99325]" />
                <span>Open Immersive Gallery</span>
              </button>

              <div className="absolute bottom-4 right-4 bg-black/65 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                {selectedImageIndex + 1} of {images.length} Photos
              </div>
            </div>

            {/* Right Asymmetric Preview Tiles on Desktop */}
            {images.length > 1 && (
              <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-3 h-[480px]">
                {images.slice(1, 3).map((img, i) => {
                  const actualIdx = i + 1;
                  return (
                    <div
                      key={actualIdx}
                      onClick={() => {
                        setSelectedImageIndex(actualIdx);
                        if (i === 1 && images.length > 3) setIsLightboxOpen(true);
                      }}
                      className="relative rounded-2xl overflow-hidden bg-stone-100 cursor-pointer group"
                    >
                      <img
                        src={img}
                        alt={`${title} view ${actualIdx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                      />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                      {i === 1 && images.length > 3 && (
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                          <span className="text-xl font-black text-[#e0aa3e]">+{images.length - 2}</span>
                          <span className="text-xs font-bold uppercase tracking-wider mt-0.5">More Photos</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {images.length === 2 && (
                  <div
                    onClick={() => setIsBrochureOpen(true)}
                    className="relative rounded-2xl overflow-hidden bg-[#013E18] text-[#F5F2E9] p-6 flex flex-col justify-between cursor-pointer group border border-[#C99325]/30"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C99325]">
                      Executive Dossier
                    </div>
                    <div>
                      <div className="text-lg font-extrabold leading-snug">
                        Download & Print Official Property Brochure
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#e0aa3e] group-hover:translate-x-1 transition-transform">
                        <FileText className="w-4 h-4" />
                        <span>Open Brochure Preview</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#013E18] ring-2 ring-[#C99325]'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Main Grid: Details Brochure (Left 8 Cols) + Sticky Enquiry (Right 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Key Pricing Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#C99325] bg-[#C99325]/10 px-2.5 py-0.5 rounded">
                      {property.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs font-bold text-[#013E18] bg-[#013E18]/10 px-2.5 py-0.5 rounded uppercase">
                      For {property.listingType}
                    </span>
                    {property.approvalAuthority && (
                      <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {property.approvalAuthority} Approved
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight leading-snug">
                    {title}
                  </h1>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 mt-2">
                    <MapPin className="w-4 h-4 text-[#C99325] shrink-0" />
                    <span className="font-medium">{property.address || `${property.location}, ${property.district}, Tamil Nadu - ${property.pincode}`}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="md:text-right shrink-0">
                  <div className="text-2xl sm:text-4xl font-black text-[#013E18] tracking-tight">
                    {formatPriceINR(property.price, property.listingType, property.priceUnit)}
                  </div>
                  <div className="text-xs text-stone-500 font-semibold mt-1">
                    {property.negotiable ? 'Price Negotiable' : 'Fixed Direct Price'}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {property.listingDate ? `Listed on ${property.listingDate}` : 'Recently Listed'}
                  </div>
                </div>
              </div>

              {/* Key Highlights Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center">
                <div className="p-3.5 bg-[#FAF8F2] rounded-2xl border border-stone-200/60">
                  <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Plot Area</div>
                  <div className="text-sm sm:text-base font-black text-[#18241B] mt-0.5">
                    {property.plotArea} {property.plotAreaUnit}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {property.plotAreaUnit === 'cents' ? `~${Math.round(property.plotArea * 435.6)} sq.ft` : ''}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F2] rounded-2xl border border-stone-200/60">
                  <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Built-Up Area</div>
                  <div className="text-sm sm:text-base font-black text-[#18241B] mt-0.5">
                    {property.builtUpArea ? `${property.builtUpArea} sq.ft` : 'N/A (Plot)'}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {property.floors ? `${property.floors} Floors` : 'Ground'}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F2] rounded-2xl border border-stone-200/60">
                  <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Configuration</div>
                  <div className="text-sm sm:text-base font-black text-[#18241B] mt-0.5">
                    {property.bedrooms ? `${property.bedrooms} BHK` : `${property.roadWidthFeet || 30}ft Road`}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {property.bathrooms ? `${property.bathrooms} Baths` : 'Clear Access'}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F2] rounded-2xl border border-stone-200/60">
                  <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Facing</div>
                  <div className="text-sm sm:text-base font-black text-[#18241B] mt-0.5">
                    {property.facing}
                  </div>
                  <div className="text-[10px] text-stone-500">Vaastu Aligned</div>
                </div>
              </div>

            </div>

            {/* Description & Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <h2 className="text-lg font-bold text-[#18241B] mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#C99325]" />
                <span>{t.propertyDetails.overview}</span>
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Specifications Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <h2 className="text-lg font-bold text-[#18241B] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#013E18]" />
                <span>{t.propertyDetails.specifications}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Listing ID:</span>
                  <span className="font-bold text-[#18241B]">{property.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Property Category:</span>
                  <span className="font-bold text-[#18241B] capitalize">{property.category.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Ownership Verification:</span>
                  <span className="font-bold text-[#013E18]">
                    {property.ownershipType === 'company' ? 'Grounds & Gates Owned' : 'Private Seller'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Approach Road Width:</span>
                  <span className="font-bold text-[#18241B]">{property.roadWidthFeet || 30} Feet Blacktop</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Approval Status:</span>
                  <span className="font-bold text-emerald-800">{property.approvalAuthority || 'Clear Patta'} Approved</span>
                </div>
                {property.reraId && (
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">RERA Registration:</span>
                    <span className="font-bold text-[#18241B]">{property.reraId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Water Sources:</span>
                  <span className="font-bold text-[#18241B]">{property.waterSource?.join(', ') || 'Borewell Available'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Electricity Supply:</span>
                  <span className="font-bold text-[#18241B]">{property.electricitySupply || 'EB 3-Phase Available'}</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <h2 className="text-lg font-bold text-[#18241B] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C99325]" />
                <span>{t.propertyDetails.amenities}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F2] border border-stone-200/60 text-xs font-semibold text-stone-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#013E18] shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Facilities & Distances */}
            {property.nearbyFacilities && property.nearbyFacilities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                <h2 className="text-lg font-bold text-[#18241B] mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#C99325]" />
                  <span>{t.propertyDetails.nearby}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.nearbyFacilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-stone-100 bg-stone-50/70 text-xs"
                    >
                      <span className="font-bold text-[#18241B]">{fac.name}</span>
                      <span className="font-extrabold text-[#013E18] bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        {fac.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulated Location Map Preview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-[#18241B] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C99325]" />
                  <span>{t.propertyDetails.locationPreview}</span>
                </h2>
                <span className="text-[11px] text-stone-400">{t.propertyDetails.mapNotice}</span>
              </div>

              {/* Styled Interactive Map Mockup */}
              <div className="relative h-64 rounded-2xl overflow-hidden border border-stone-200 bg-[#E8E2D5] flex items-center justify-center">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#013E18_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Simulated Roads & Water Bodies */}
                <div className="absolute top-1/2 left-0 right-0 h-4 bg-stone-400/50 -rotate-6" />
                <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-stone-400/50" />
                
                {/* Central Pin */}
                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <div className="bg-[#013E18] text-[#F5F2E9] p-2 rounded-full shadow-xl border-2 border-[#C99325]">
                    <MapPin className="w-6 h-6 text-[#C99325] fill-[#C99325]" />
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full text-xs font-black text-[#18241B] shadow-md mt-1 border border-stone-300">
                    {property.location}, {property.district}
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-stone-600">
                  Tamil Nadu GIS Coordinate Map Preview
                </div>
              </div>
            </div>

            {/* Estimated Monthly EMI Calculator (Pre-filled with Property Price) */}
            <div className="pt-2">
              <EmiCalculator initialPrice={property.price} lang={lang} />
            </div>

          </div>

          {/* Right Column (4 cols): Sticky Seller & Enquiry Widget */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              {/* Seller Information Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {t.propertyDetails.sellerInfo}
                  </div>
                  {property.ownershipType === 'company' ? (
                    <span className="text-[10px] font-bold bg-[#013E18] text-white px-2 py-0.5 rounded">
                      Corporate Desk
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Third-Party Seller
                    </span>
                  )}
                </div>

                {/* Seller Bio */}
                <div className="pt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#013E18]/10 text-[#013E18] font-black text-base flex items-center justify-center shrink-0 border border-[#013E18]/20 overflow-hidden">
                    {property.seller.avatarUrl ? (
                      <img src={property.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-[#013E18]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#18241B] leading-tight">
                      {property.seller.name}
                    </h3>
                    <div className="text-xs text-stone-500 font-medium">
                      {property.seller.badgeTitle || (property.ownershipType === 'company' ? 'Grounds & Gates Advisory Team' : 'Property Representative')}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Responds within {property.seller.responseTimeMinutes || 15} mins</span>
                    </div>
                  </div>
                </div>

                {/* Guarantee Banner */}
                <div className="mt-4 p-3 rounded-xl bg-[#FAF8F2] border border-stone-200/80 text-xs text-stone-600 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#013E18] shrink-0 mt-0.5" />
                  <p>
                    {property.ownershipType === 'company'
                      ? '100% transparent legal title, clear single-owner patta, and direct corporate assistance.'
                      : 'Direct contact with registered property owner. No advance token fees required.'}
                  </p>
                </div>

                {/* Contact Buttons */}
                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={onOpenEnquiry}
                    className="w-full py-3 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#C99325]" />
                    <span>{t.propertyDetails.scheduleVisit}</span>
                  </button>

                  <button
                    onClick={onOpenEnquiry}
                    className="w-full py-2.5 rounded-xl border-2 border-[#013E18] text-[#013E18] hover:bg-[#013E18]/5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-[#C99325]" />
                    <span>{t.propertyDetails.contactSeller}</span>
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <a
                    href="tel:+914222987000"
                    className="text-xs text-stone-500 hover:text-[#013E18] font-medium flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-[#C99325]" />
                    <span>Direct Desk: +91 422 298 7000</span>
                  </a>
                </div>
              </div>

              {/* Demo Listing Disclaimer Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 leading-relaxed">
                <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>CEO Presentation Demo Listing</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Real photographs are illustrative media. All specifications, seller names, and prices are demonstration records prepared for executive evaluation.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C99325]">
                  Curated Alternatives
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#18241B] tracking-tight mt-0.5">
                  {t.propertyDetails.similarProperties}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  lang={lang}
                  isSaved={savedPropertyIds.includes(p.id)}
                  onToggleSave={onToggleSave}
                  isCompared={comparedPropertyIds.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                  onSelect={onSelectProperty}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Mobile Enquiry Bar */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-30 bg-white/95 backdrop-blur-xl border-t border-stone-200 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {property.negotiable ? 'Negotiable Price' : 'Direct Price'}
          </div>
          <div className="text-lg font-black text-[#013E18] truncate">
            {formatPriceINR(property.price, property.listingType, property.priceUnit)}
          </div>
        </div>
        <button
          onClick={onOpenEnquiry}
          className="px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#C99325]" />
          <span>{t.propertyDetails.scheduleVisit}</span>
        </button>
      </div>

      {/* Immersive Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 select-none"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm sm:text-base line-clamp-1">{title}</h3>
                <p className="text-xs text-white/60">
                  {property.location}, {property.district} • {formatPriceINR(property.price, property.listingType, property.priceUnit)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/70 font-mono">
                  {selectedImageIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Image with Previous / Next Arrows */}
            <div className="relative flex-1 flex items-center justify-center my-4">
              {images.length > 1 && (
                <button
                  onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                src={images[selectedImageIndex]}
                alt={title}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              />

              {images.length > 1 && (
                <button
                  onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto pt-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#C99325] scale-105 opacity-100'
                        : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Printable Brochure Modal */}
      <AnimatePresence>
        {isBrochureOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8"
            >
              {/* Header */}
              <div className="bg-[#013E18] text-white p-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                      <path d="M0 0H100V20.5H22.7V79.5H72.6V100H0V0Z" fill="#FFFFFF" />
                      <path d="M38.7 40H100V100H79V60.5H38.7V40Z" fill="#C99325" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#C99325] font-bold">Grounds & Gates Official Brochure</div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsBrochureOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close brochure modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brochure Content */}
              <div className="p-6 sm:p-8 space-y-6 text-stone-800">
                <div className="relative h-64 rounded-2xl overflow-hidden bg-stone-100">
                  <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-3 bg-[#013E18]/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {formatPriceINR(property.price, property.listingType, property.priceUnit)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-y border-stone-100 py-4">
                  <div className="p-2 bg-[#FAF8F2] rounded-xl">
                    <div className="text-[10px] text-stone-400 font-bold uppercase">Area</div>
                    <div className="text-sm font-extrabold text-[#013E18]">{property.plotArea} {property.plotAreaUnit}</div>
                  </div>
                  <div className="p-2 bg-[#FAF8F2] rounded-xl">
                    <div className="text-[10px] text-stone-400 font-bold uppercase">Road Width</div>
                    <div className="text-sm font-extrabold text-[#013E18]">{property.roadWidthFeet || 30} Feet</div>
                  </div>
                  <div className="p-2 bg-[#FAF8F2] rounded-xl">
                    <div className="text-[10px] text-stone-400 font-bold uppercase">Facing</div>
                    <div className="text-sm font-extrabold text-[#013E18]">{property.facing}</div>
                  </div>
                  <div className="p-2 bg-[#FAF8F2] rounded-xl">
                    <div className="text-[10px] text-stone-400 font-bold uppercase">Approval</div>
                    <div className="text-sm font-extrabold text-[#013E18]">{property.approvalAuthority || 'Verified'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#013E18] mb-1.5">Location & Address</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{property.address || `${property.location}, ${property.district}, Tamil Nadu - ${property.pincode}`}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#013E18] mb-1.5">Summary & Highlights</h4>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">{description}</p>
                </div>

                {/* Corporate Contact Footer */}
                <div className="bg-[#FAF8F2] rounded-2xl p-4 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs">
                    <div className="font-bold text-[#013E18]">Grounds & Gates Realty Pvt Ltd</div>
                    <div className="text-stone-500">Avinashi Road, Coimbatore • +91 422 298 7000</div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#013E18] hover:bg-[#00280f] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4 text-[#C99325]" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
