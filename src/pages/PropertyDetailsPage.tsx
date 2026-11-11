import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

interface PropertyDetailsPageProps {
  property: Property;
  allProperties: Property[];
  lang: LanguageCode;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isCompared: boolean;
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
  onToggleSave,
  isCompared,
  onToggleCompare,
  onSelectProperty,
  onOpenEnquiry
}) => {
  const t = translations[lang];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);

  const title = lang === 'ta' && property.tamilTitle ? property.tamilTitle : property.title;
  const description = lang === 'ta' && property.tamilDescription ? property.tamilDescription : property.description;

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Main Grid: Gallery & Details (Left 8 Cols) + Sticky Enquiry (Right 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery Section */}
            <div className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200 shadow-xs overflow-hidden">
              {/* Main Image */}
              <div className="relative h-72 sm:h-96 md:h-[460px] rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={images[selectedImageIndex]}
                  alt={title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge type="demo" size="md" />
                  {property.ownershipType === 'company' ? (
                    <Badge type="company" size="md" />
                  ) : (
                    <Badge type="third-party" label={property.seller.badgeTitle} size="md" />
                  )}
                  {property.featured && <Badge type="featured" size="md" />}
                </div>

                {/* Image Count Indicator */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedImageIndex + 1} of {images.length} Photos
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-[#013E18] ring-2 ring-[#C99325]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  <span>Marketplace Verified Listing</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Real photographs are illustrative media. All specifications, seller names, and prices are demonstration records for Grounds & Gates platform preview.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#18241B] tracking-tight mb-6">
              {t.propertyDetails.similarProperties}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  lang={lang}
                  isSaved={false}
                  onToggleSave={() => {}}
                  isCompared={false}
                  onToggleCompare={() => {}}
                  onSelect={onSelectProperty}
                />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
