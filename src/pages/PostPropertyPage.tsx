import React, { useState } from 'react';
import { Property, LanguageCode, PropertyCategory, ListingType, FacingDirection, SellerType } from '../types/property';
import { CATEGORIES_DATA } from '../data/categories';
import { LOCATIONS_DATA } from '../data/locations';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import { Badge } from '../components/common/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface PostPropertyPageProps {
  lang: LanguageCode;
  onListingCreated: (newProperty: Property) => void;
  onNavigate: (view: string, params?: any) => void;
}

const SAMPLE_PHOTO_CHOICES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',
];

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({
  lang,
  onListingCreated,
  onNavigate
}) => {
  const t = translations[lang];
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedPropertyId, setSubmittedPropertyId] = useState<string | null>(null);

  // Form State
  const [listingType, setListingType] = useState<ListingType>('buy');
  const [category, setCategory] = useState<PropertyCategory>('residential-plots');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Location
  const [state] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Coimbatore');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('641035');
  const [address, setAddress] = useState('');

  // Specs
  const [plotArea, setPlotArea] = useState<number>(5.0);
  const [plotAreaUnit, setPlotAreaUnit] = useState<'cents' | 'sq.ft' | 'acres'>('cents');
  const [builtUpArea, setBuiltUpArea] = useState<number>(0);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [facing, setFacing] = useState<FacingDirection>('East');
  const [roadWidthFeet, setRoadWidthFeet] = useState<number>(33);
  const [approvalAuthority, setApprovalAuthority] = useState<'DTCP' | 'CMDA' | 'RERA' | 'Agricultural Patta'>('DTCP');

  // Pricing
  const [price, setPrice] = useState<number>(4500000);
  const [negotiable, setNegotiable] = useState(true);

  // Images
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([
    SAMPLE_PHOTO_CHOICES[0],
    SAMPLE_PHOTO_CHOICES[1]
  ]);

  // Seller
  const [sellerName, setSellerName] = useState('Mohanraj S.');
  const [sellerPhone, setSellerPhone] = useState('+91 98422 71000');
  const [sellerEmail, setSellerEmail] = useState('mohanrajs0410@gmail.com');
  const [sellerType, setSellerType] = useState<SellerType>('owner');

  const [formError, setFormError] = useState('');

  const steps = [
    { num: 1, label: t.postProperty.step1 },
    { num: 2, label: t.postProperty.step2 },
    { num: 3, label: t.postProperty.step3 },
    { num: 4, label: t.postProperty.step4 },
    { num: 5, label: t.postProperty.step5 },
    { num: 6, label: t.postProperty.step6 },
    { num: 7, label: t.postProperty.step7 },
  ];

  const handleNext = () => {
    setFormError('');
    if (currentStep === 1) {
      if (!title.trim()) {
        setFormError('Please enter a descriptive property headline/title.');
        return;
      }
    } else if (currentStep === 2) {
      if (!locality.trim()) {
        setFormError('Please provide the locality or area name.');
        return;
      }
    } else if (currentStep === 4) {
      if (price <= 0) {
        setFormError('Please specify a valid expected price.');
        return;
      }
    } else if (currentStep === 6) {
      if (!sellerName.trim() || !sellerPhone.trim()) {
        setFormError('Please enter your contact details.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handlePrev = () => {
    setFormError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const togglePhoto = (url: string) => {
    if (selectedPhotos.includes(url)) {
      if (selectedPhotos.length > 1) {
        setSelectedPhotos(selectedPhotos.filter(u => u !== url));
      }
    } else {
      setSelectedPhotos([...selectedPhotos, url]);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPropertyId = `user-demo-${Date.now()}`;
    const newProperty: Property = {
      id: newPropertyId,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      description: description || 'Premium property situated in prime growth corridor of Tamil Nadu. Clear documents and ready access.',
      category,
      listingType,
      ownershipType: 'third-party',
      price,
      priceUnit: listingType === 'rent' ? '/ Month' : 'Total',
      negotiable,
      location: locality || 'Coimbatore',
      district,
      state,
      pincode,
      address: address || `${locality}, ${district}`,
      plotArea,
      plotAreaUnit,
      builtUpArea: builtUpArea > 0 ? builtUpArea : undefined,
      bedrooms: (category === 'villas' || category === 'apartments' || category === 'independent-houses') ? bedrooms : undefined,
      bathrooms: (category === 'villas' || category === 'apartments' || category === 'independent-houses') ? bathrooms : undefined,
      facing,
      roadWidthFeet,
      approvalAuthority,
      amenities: ['Blacktop Road Access', 'Electricity Connection', 'Clear Title Patta', 'Sweet Groundwater'],
      nearbyFacilities: [
        { name: `${district} Central Hub`, distance: '3.0 km', type: 'transit' }
      ],
      images: selectedPhotos,
      seller: {
        name: sellerName,
        type: sellerType,
        phone: sellerPhone,
        email: sellerEmail,
        badgeTitle: sellerType === 'owner' ? 'Direct Property Owner' : 'Registered Broker',
        responseTimeMinutes: 30
      },
      listingDate: new Date().toISOString().split('T')[0],
      status: 'active',
      featured: false,
      demoLabel: 'Demo Listing'
    };

    onListingCreated(newProperty);
    setSubmittedPropertyId(newPropertyId);
  };

  if (submittedPropertyId) {
    return (
      <div className="bg-[#FAF8F2] min-h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-stone-200 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
            Frontend Demo Submission Logged
          </span>

          <h2 className="text-2xl font-extrabold text-[#18241B] mt-2">
            {t.postProperty.successTitle}
          </h2>

          <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
            {t.postProperty.successDesc}
          </p>

          <div className="bg-[#FAF8F2] rounded-2xl p-4 mt-6 border border-stone-200 text-left text-xs space-y-1">
            <div className="font-bold text-[#013E18] text-sm mb-1">{title}</div>
            <div>• Category: <strong className="capitalize">{category.replace('-', ' ')}</strong></div>
            <div>• Location: <strong>{locality}, {district}</strong></div>
            <div>• Expected Price: <strong>{formatPriceINR(price, listingType)}</strong></div>
            <div>• Contact: <strong>{sellerName} ({sellerPhone})</strong></div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={() => onNavigate('properties')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] shadow-md transition-all cursor-pointer"
            >
              {t.postProperty.viewInMarketplace}
            </button>
            <button
              onClick={() => onNavigate('seller-dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#013E18] text-[#013E18] font-bold text-xs hover:bg-[#013E18]/5 transition-all cursor-pointer"
            >
              {t.postProperty.manageInDashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99325] uppercase tracking-wider mb-2">
            <AutoAwesomeIcon sx={{ fontSize: 14 }} />
            <span>Zero Listing Fee for Owners</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight">
            {t.postProperty.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {t.postProperty.subtitle}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs mb-8">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {steps.map(s => {
              const isDone = s.num < currentStep;
              const isCurrent = s.num === currentStep;

              return (
                <div key={s.num} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#013E18] text-[#C99325] ring-2 ring-[#C99325]'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isDone ? <CheckIcon sx={{ fontSize: 16 }} /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden md:inline ${
                      isCurrent ? 'text-[#013E18] font-bold' : isDone ? 'text-stone-700' : 'text-stone-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.num < 7 && <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-md">
          
          {formError && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {formError}
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 1: Basic Property Information
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  {t.postProperty.listingType}
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setListingType('buy')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      listingType === 'buy'
                        ? 'bg-[#013E18] text-white border-[#013E18]'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {t.postProperty.sell}
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType('rent')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      listingType === 'rent'
                        ? 'bg-[#013E18] text-white border-[#013E18]'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {t.postProperty.rentOut}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  {t.postProperty.category}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES_DATA.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#013E18]/5 border-[#013E18] ring-1 ring-[#013E18]'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#18241B]">{cat.name}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{cat.tamilName}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.postProperty.titleLabel} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.postProperty.titlePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.postProperty.descLabel}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.postProperty.descPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 2: Property Location
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs text-stone-600 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">District / City *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden bg-white"
                  >
                    {LOCATIONS_DATA.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name} ({loc.tamilName})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Locality / Area Name *</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Saravanampatti, Vadavalli, OMR"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Postal Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="641035"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Street Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Phase 2, Green Enclave, Behind KGISL IT Park"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Specifications */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 3: Property Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Plot Area *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={plotArea}
                    onChange={(e) => setPlotArea(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Plot Unit</label>
                  <select
                    value={plotAreaUnit}
                    onChange={(e) => setPlotAreaUnit(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden bg-white"
                  >
                    <option value="cents">Cents (~435.6 sq.ft each)</option>
                    <option value="sq.ft">Square Feet (sq.ft)</option>
                    <option value="acres">Acres (100 Cents)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Built-Up Area (sq.ft)</label>
                  <input
                    type="number"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                    placeholder="0 if vacant plot"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Bedrooms (BHK)</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden bg-white"
                  >
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Facing Direction</label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden bg-white"
                  >
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                    <option value="North-East">North-East</option>
                    <option value="South-East">South-East</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Approach Road Width</label>
                  <input
                    type="number"
                    value={roadWidthFeet}
                    onChange={(e) => setRoadWidthFeet(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Approval Authority</label>
                <select
                  value={approvalAuthority}
                  onChange={(e) => setApprovalAuthority(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-[#18241B] focus:border-[#013E18] outline-hidden bg-white"
                >
                  <option value="DTCP">DTCP Approved (Coimbatore, Salem, etc.)</option>
                  <option value="CMDA">CMDA Approved (Chennai Metropolitan)</option>
                  <option value="RERA">RERA Registered Layout</option>
                  <option value="Agricultural Patta">Agricultural Patta Land</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 4: Pricing & Terms
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Expected Price (INR ₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-[#013E18] focus:border-[#013E18] outline-hidden"
                />
                <div className="text-xs font-semibold text-[#C99325] mt-1.5">
                  Formatted: {formatPriceINR(price, listingType)}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => setNegotiable(e.target.checked)}
                    className="rounded text-[#013E18] focus:ring-[#013E18]"
                  />
                  <span>{t.postProperty.priceNegotiable}</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Photos */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 5: Illustrative Photographs
              </h2>
              <p className="text-xs text-stone-500">
                Select high-resolution demo photos from our curated gallery to represent this property.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SAMPLE_PHOTO_CHOICES.map((url, i) => {
                  const isSelected = selectedPhotos.includes(url);
                  return (
                    <div
                      key={i}
                      onClick={() => togglePhoto(url)}
                      className={`relative h-28 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected ? 'border-[#013E18] ring-2 ring-[#C99325]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#013E18] text-white flex items-center justify-center shadow-md">
                          <CheckIcon sx={{ fontSize: 14 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-stone-500 font-medium">
                {selectedPhotos.length} photo(s) selected for demo listing.
              </div>
            </div>
          )}

          {/* STEP 6: Seller Info */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 6: Seller Contact Information
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.postProperty.sellerType}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'owner', label: t.postProperty.owner },
                    { id: 'agent', label: t.postProperty.agent },
                    { id: 'builder', label: t.postProperty.builder },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSellerType(item.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sellerType === item.id
                          ? 'bg-[#013E18] text-white border-[#013E18]'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.postProperty.sellerName} *
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.postProperty.sellerPhone} *
                  </label>
                  <input
                    type="tel"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.postProperty.sellerEmail}
                  </label>
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18241B] focus:border-[#013E18] outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Preview & Submit */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                Step 7: Final Review & Submit
              </h2>

              <div className="bg-[#FAF8F2] rounded-2xl p-5 border border-stone-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge type="demo" size="sm" />
                  <span className="text-xs font-bold uppercase text-[#C99325]">{category.replace('-', ' ')}</span>
                  <span className="text-xs text-stone-500 font-semibold">• For {listingType}</span>
                </div>

                <div className="text-lg font-extrabold text-[#18241B]">{title}</div>
                <div className="text-xl font-black text-[#013E18]">{formatPriceINR(price, listingType)}</div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-stone-700 pt-2 border-t border-stone-200">
                  <div>Location: <strong>{locality}, {district}</strong></div>
                  <div>Area: <strong>{plotArea} {plotAreaUnit}</strong></div>
                  <div>Facing: <strong>{facing}</strong></div>
                  <div>Seller: <strong>{sellerName}</strong></div>
                  <div>Phone: <strong>{sellerPhone}</strong></div>
                  <div>Approval: <strong>{approvalAuthority}</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <VerifiedUserIcon sx={{ fontSize: 20, color: '#b45309', flexShrink: 0, mt: '2px' }} />
                <p>
                  <strong>Listing Notice:</strong> Clicking "Submit Demo Listing" adds this record to the active marketplace dataset in memory and links it to your Seller Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Action Footer */}
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-stone-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 font-bold text-xs text-stone-700 transition-colors cursor-pointer"
              >
                {t.postProperty.prev}
              </button>
            ) : <div />}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{t.postProperty.next}</span>
                <ChevronRightIcon sx={{ fontSize: 16, color: '#C99325' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-8 py-3 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckIcon sx={{ fontSize: 16, color: '#C99325' }} />
                <span>{t.postProperty.submit}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
