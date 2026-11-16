import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property, LanguageCode, PropertyCategory, ListingType, FacingDirection, SellerType } from '../types/property';
import { useAppState } from '../context/AppStateContext';
import { CATEGORIES_DATA } from '../data/categories';
import { LOCATIONS_DATA } from '../data/locations';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';
import { api } from '../services/api';
import { PropertyLocationPicker, LocationPickerValue } from '../components/map/PropertyLocationPicker';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VideocamIcon from '@mui/icons-material/Videocam';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';

interface PostPropertyPageProps {
  lang: LanguageCode;
  isEditMode?: boolean;
  editIdOrSlug?: string;
  onListingCreated: (newProperty: Property) => void;
  onNavigate: (view: string, params?: any) => void;
}

interface UploadedDocument {
  title: string;
  url: string;
  documentType: string;
  isPrivate: boolean;
  uploadedAt?: string;
}

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({
  lang,
  isEditMode = false,
  editIdOrSlug,
  onListingCreated,
  onNavigate,
}) => {
  const t = translations[lang];
  const { masters } = useAppState();

  const [currentStep, setCurrentStep] = useState(1);
  const [submittedPropertyId, setSubmittedPropertyId] = useState<string | null>(null);
  const [draftToast, setDraftToast] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingDraftAlert, setExistingDraftAlert] = useState<{ id: string; title: string; step: number } | null>(null);

  // Category Change Confirmation Modal state
  const [pendingCategoryChange, setPendingCategoryChange] = useState<PropertyCategory | null>(null);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);

  // ─── Form State ──────────────────────────────────────────────
  // Step 1: Basic details
  const [listingType, setListingType] = useState<ListingType>('buy');
  const [category, setCategory] = useState<PropertyCategory>('residential-plots');
  const [sellerRole, setSellerRole] = useState<SellerType>('owner');
  const [projectName, setProjectName] = useState('');
  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tamilDescription, setTamilDescription] = useState('');
  const [furnishingStatus, setFurnishingStatus] = useState<'unfurnished' | 'semi-furnished' | 'fully-furnished'>('unfurnished');
  const [constructionStatus, setConstructionStatus] = useState<'ready-to-move' | 'under-construction' | 'new-launch'>('ready-to-move');

  // Step 2: Location
  const [state] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Coimbatore');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('641035');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [mapLocation, setMapLocation] = useState<LocationPickerValue>({
    lat: 11.0168,
    lng: 76.9558,
    confirmed: false,
    isApproximate: false,
  });

  // Step 3: Specifications (Category-Aware)
  const [plotArea, setPlotArea] = useState<number>(5.0);
  const [plotAreaUnit, setPlotAreaUnit] = useState<'cents' | 'sq.ft' | 'acres'>('cents');
  const [plotLength, setPlotLength] = useState<number | ''>('');
  const [plotWidth, setPlotWidth] = useState<number | ''>('');
  const [roadWidthFeet, setRoadWidthFeet] = useState<number>(30);
  const [roadType, setRoadType] = useState<'tar' | 'concrete' | 'gravel' | 'mud'>('tar');
  const [facing, setFacing] = useState<FacingDirection>('East');
  const [isCornerPlot, setIsCornerPlot] = useState<boolean>(false);
  const [isGatedLayout, setIsGatedLayout] = useState<boolean>(false);
  const [boundaryWall, setBoundaryWall] = useState<boolean>(false);

  // Residential specs (Houses / Villas / Apartments)
  const [builtUpArea, setBuiltUpArea] = useState<number | ''>('');
  const [carpetArea, setCarpetArea] = useState<number | ''>('');
  const [superBuiltUpArea, setSuperBuiltUpArea] = useState<number | ''>('');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [balconies, setBalconies] = useState<number>(1);
  const [floors, setFloors] = useState<number>(1);
  const [floorNumber, setFloorNumber] = useState<number | ''>('');
  const [totalFloors, setTotalFloors] = useState<number | ''>('');
  const [parkingSpaces, setParkingSpaces] = useState<number>(1);
  const [parkingType, setParkingType] = useState<'covered' | 'open' | 'none'>('covered');
  const [hasLift, setHasLift] = useState<boolean>(false);
  const [propertyAgeYears, setPropertyAgeYears] = useState<number | ''>('');

  // Agricultural specs
  const [landUseClassification, setLandUseClassification] = useState<'dry-land' | 'wet-land' | 'garden-land'>('garden-land');
  const [irrigationSource, setIrrigationSource] = useState<string[]>(['Borewell']);
  const [cropType, setCropType] = useState<string>('');
  const [soilType, setSoilType] = useState<string>('Red Soil');
  const [structuresOnLand, setStructuresOnLand] = useState<string[]>([]);

  // Commercial specs
  const [commercialSubtype, setCommercialSubtype] = useState<'office' | 'retail' | 'warehouse' | 'industrial' | 'land'>('office');
  const [powerLoadKw, setPowerLoadKw] = useState<number | ''>('');
  const [frontageFeet, setFrontageFeet] = useState<number | ''>('');
  const [ceilingHeightFeet, setCeilingHeightFeet] = useState<number | ''>('');
  const [suitableUse, setSuitableUse] = useState<string[]>(['IT Office', 'Corporate Office']);

  // Step 4: Pricing & Availability
  const [price, setPrice] = useState<number>(4500000);
  const [priceBasis, setPriceBasis] = useState<'total' | 'per_cent' | 'per_sqft' | 'per_acre' | 'per_month'>('total');
  const [negotiable, setNegotiable] = useState<boolean>(true);
  const [deposit, setDeposit] = useState<number | ''>('');
  const [maintenanceFee, setMaintenanceFee] = useState<number | ''>('');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [possessionDate, setPossessionDate] = useState<string>('');

  // Step 5: Amenities & Utilities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [waterSource, setWaterSource] = useState<string[]>(['Borewell', 'Corporation / Siruvani Water']);
  const [electricitySupply, setElectricitySupply] = useState<string>('EB 3-Phase Available');

  // Step 6: Approvals & Private Documents
  const [approvalAuthority, setApprovalAuthority] = useState<'DTCP' | 'CMDA' | 'RERA' | 'Panchayat' | 'Agricultural Patta'>('DTCP');
  const [approvalNumber, setApprovalNumber] = useState<string>('');
  const [reraId, setReraId] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [newDocType, setNewDocType] = useState('Patta / Chitta');
  const [newDocTitle, setNewDocTitle] = useState('');

  // Step 7: Media (Photos, Video, Floor Plans)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoType, setVideoType] = useState<'direct' | 'youtube' | 'vimeo'>('direct');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [floorPlans, setFloorPlans] = useState<string[]>([]);
  const [isUploadingFloorPlan, setIsUploadingFloorPlan] = useState(false);

  // Step 8: Contact preferences
  const [sellerName, setSellerName] = useState('Property Owner');
  const [sellerPhone, setSellerPhone] = useState('+91 98422 71000');
  const [sellerEmail, setSellerEmail] = useState('');
  const [allowWhatsApp, setAllowWhatsApp] = useState<boolean>(true);
  const [preferredContactHours, setPreferredContactHours] = useState<string>('10:00 AM - 7:00 PM');
  const [siteVisitDays, setSiteVisitDays] = useState<string[]>(['Saturday', 'Sunday']);

  // Existing property reference for edit mode or resuming drafts
  const [editingReferenceId, setEditingReferenceId] = useState<string | null>(null);

  // ─── Load Existing Draft or Property in Edit Mode ───────────
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        if (isEditMode && editIdOrSlug) {
          const prop = await api.getSellerProperty(editIdOrSlug);
          if (prop && isMounted) {
            populateFormFromProperty(prop);
            setEditingReferenceId(prop.id || (prop as any).referenceId);
          }
        } else {
          // Check for existing pending draft
          const draft = await api.getMyDraftProperty();
          if (draft && isMounted && draft.id) {
            setExistingDraftAlert({
              id: draft.id,
              title: draft.title || 'Untitled Draft',
              step: draft.draftStep || 1,
            });
          }
        }
      } catch (err) {
        console.warn('Draft / edit property lookup notice:', err);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, editIdOrSlug]);

  const populateFormFromProperty = (p: Property) => {
    setTitle(p.title || '');
    setTamilTitle(p.tamilTitle || '');
    setDescription(p.description || '');
    setTamilDescription(p.tamilDescription || '');
    setCategory(p.category || 'residential-plots');
    setListingType(p.listingType || 'buy');
    if (p.seller?.type) setSellerRole(p.seller.type);
    if (p.furnishingStatus) setFurnishingStatus(p.furnishingStatus);
    if (p.constructionStatus) setConstructionStatus(p.constructionStatus);

    setDistrict(p.district || 'Coimbatore');
    setLocality(p.locality || p.location || '');
    setPincode(p.pincode || '');
    setAddress(p.address || '');
    setLandmark(p.landmark || '');

    const pLat = p.coordinates?.lat || p.locationGeo?.coordinates?.[1] || 11.0168;
    const pLng = p.coordinates?.lng || p.locationGeo?.coordinates?.[0] || 76.9558;
    setMapLocation({
      lat: pLat,
      lng: pLng,
      confirmed: Boolean(p.locationConfirmed),
      isApproximate: Boolean(p.isApproximateLocation),
    });

    setPlotArea(p.plotArea || 0);
    setPlotAreaUnit(p.plotAreaUnit || 'cents');
    if (p.plotLength) setPlotLength(p.plotLength);
    if (p.plotWidth) setPlotWidth(p.plotWidth);
    if (p.roadWidthFeet) setRoadWidthFeet(p.roadWidthFeet);
    if (p.roadType) setRoadType(p.roadType);
    if (p.facing) setFacing(p.facing);
    setIsCornerPlot(Boolean(p.isCornerPlot));
    setIsGatedLayout(Boolean(p.isGatedLayout));
    setBoundaryWall(Boolean(p.boundaryWall));

    if (p.builtUpArea) setBuiltUpArea(p.builtUpArea);
    if (p.carpetArea) setCarpetArea(p.carpetArea);
    if (p.superBuiltUpArea) setSuperBuiltUpArea(p.superBuiltUpArea);
    if (p.bedrooms) setBedrooms(p.bedrooms);
    if (p.bathrooms) setBathrooms(p.bathrooms);
    if (p.balconies) setBalconies(p.balconies);
    if (p.floors) setFloors(p.floors);
    if (p.floorNumber !== undefined) setFloorNumber(p.floorNumber);
    if (p.totalFloors !== undefined) setTotalFloors(p.totalFloors);
    if (p.parkingSpaces) setParkingSpaces(p.parkingSpaces);
    if (p.parkingType) setParkingType(p.parkingType);
    setHasLift(Boolean(p.hasLift));
    if (p.propertyAgeYears || p.ageOfPropertyYears) setPropertyAgeYears(p.propertyAgeYears || p.ageOfPropertyYears || '');

    if (p.landUseClassification) setLandUseClassification(p.landUseClassification);
    if (p.irrigationSource) setIrrigationSource(p.irrigationSource);
    if (p.cropType) setCropType(p.cropType);
    if (p.soilType) setSoilType(p.soilType);
    if (p.structuresOnLand) setStructuresOnLand(p.structuresOnLand);

    if (p.commercialSubtype) setCommercialSubtype(p.commercialSubtype);
    if (p.powerLoadKw) setPowerLoadKw(p.powerLoadKw);
    if (p.frontageFeet) setFrontageFeet(p.frontageFeet);
    if (p.ceilingHeightFeet) setCeilingHeightFeet(p.ceilingHeightFeet);
    if (p.suitableUse) setSuitableUse(p.suitableUse);

    setPrice(p.price || 0);
    if (p.priceBasis) setPriceBasis(p.priceBasis);
    setNegotiable(Boolean(p.negotiable));
    if (p.deposit) setDeposit(p.deposit);
    if (p.maintenanceFee) setMaintenanceFee(p.maintenanceFee);
    if (p.maintenanceFrequency) setMaintenanceFrequency(p.maintenanceFrequency);
    if (p.possessionDate) setPossessionDate(p.possessionDate);

    if (p.amenities) setSelectedAmenities(p.amenities);
    if (p.waterSource) setWaterSource(p.waterSource);
    if (p.electricitySupply) setElectricitySupply(p.electricitySupply);

    if (p.approvalAuthority) setApprovalAuthority(p.approvalAuthority);
    if (p.approvalNumber) setApprovalNumber(p.approvalNumber);
    if (p.reraId) setReraId(p.reraId);
    if (p.legalDocuments) setUploadedDocuments(p.legalDocuments as any);

    if (p.images) setSelectedPhotos(p.images);
    if (p.videoUrl) setVideoUrl(p.videoUrl);
    if (p.videoType) setVideoType(p.videoType);
    if (p.floorPlans) setFloorPlans(p.floorPlans);

    if (p.seller) {
      if (p.seller.name) setSellerName(p.seller.name);
      if (p.seller.phone) setSellerPhone(p.seller.phone);
      if (p.seller.email) setSellerEmail(p.seller.email);
    }
    if (p.contactPreferences) {
      setAllowWhatsApp(p.contactPreferences.allowWhatsApp !== false);
      if (p.contactPreferences.preferredTime) setPreferredContactHours(p.contactPreferences.preferredTime);
      if (p.contactPreferences.siteVisitDays) setSiteVisitDays(p.contactPreferences.siteVisitDays);
    }

    if (p.draftStep) {
      setCurrentStep(p.draftStep);
    }
  };

  const handleResumeDraft = async () => {
    if (!existingDraftAlert) return;
    try {
      const draft = await api.getMyDraftProperty();
      if (draft) {
        populateFormFromProperty(draft);
        setEditingReferenceId(draft.id || (draft as any).referenceId);
        setCurrentStep(draft.draftStep || 1);
        setExistingDraftAlert(null);
        showDraftToast(`Resumed draft "${draft.title || 'Untitled'}" at Step ${draft.draftStep || 1}`);
      }
    } catch (err) {
      console.error('Failed to resume draft:', err);
    }
  };

  // Master options
  const categoryOptions = useMemo(() => {
    if (masters['property_category'] && masters['property_category'].length > 0) {
      return masters['property_category'].map(c => ({
        id: c.code as PropertyCategory,
        name: c.name,
        tamilName: c.nameTa || c.name,
      }));
    }
    return CATEGORIES_DATA.map(c => ({ id: c.id, name: c.name, tamilName: c.tamilName }));
  }, [masters]);

  const districtOptions = useMemo(() => {
    if (masters['district'] && masters['district'].length > 0) {
      return masters['district'].map(d => ({
        code: d.code,
        name: d.name,
        tamilName: d.nameTa || d.name,
      }));
    }
    return LOCATIONS_DATA.map(l => ({ code: l.id, name: l.name, tamilName: l.tamilName }));
  }, [masters]);

  const activeDistrictObj = useMemo(() => {
    return districtOptions.find(d => d.name.toLowerCase() === district.toLowerCase() || d.code.toLowerCase() === district.toLowerCase());
  }, [districtOptions, district]);

  const localityOptions = useMemo(() => {
    if (!activeDistrictObj) return [];
    const locs = masters['locality'] || [];
    return locs.filter(l => l.parentCode === activeDistrictObj.code || l.parentCode === activeDistrictObj.name.toLowerCase());
  }, [masters, activeDistrictObj]);

  const facingOptions: FacingDirection[] = useMemo(() => {
    if (masters['facing_direction'] && masters['facing_direction'].length > 0) {
      return masters['facing_direction'].map(f => f.name as FacingDirection);
    }
    return ['North', 'East', 'South', 'West', 'North-East', 'South-East', 'North-West', 'South-West'];
  }, [masters]);

  const availableAmenitiesList = useMemo(() => {
    if (masters['amenity'] && masters['amenity'].length > 0) {
      return masters['amenity'].map(a => a.name);
    }
    return [
      'Gated Community with 24/7 Security',
      'Blacktop 40ft Internal Roads',
      'Underground Drainage (UGD)',
      'Solar Street Lighting',
      'Children Play Park & Walking Track',
      'Clubhouse with Gymnasium',
      'Swimming Pool',
      'Power Backup / Generator',
      'Sweet Drinking Water Connection',
      'Rainwater Harvesting Wells',
      'Clear Title Patta & Fast Registration',
      'Avenue Trees & Landscaped Parks',
    ];
  }, [masters]);

  const showDraftToast = (msg: string) => {
    setDraftToast(msg);
    setTimeout(() => setDraftToast(null), 4000);
  };

  // ─── Step Navigation & Validation ───────────────────────────
  const stepTitles = [
    { num: 1, label: lang === 'ta' ? 'அடிப்படை விவரம்' : 'Basic Details' },
    { num: 2, label: lang === 'ta' ? 'வரைபடம் & இருப்பிடம்' : 'Address & Map' },
    { num: 3, label: lang === 'ta' ? 'அளவீடுகள்' : 'Specifications' },
    { num: 4, label: lang === 'ta' ? 'விலை விவரம்' : 'Pricing' },
    { num: 5, label: lang === 'ta' ? 'வசதிகள்' : 'Amenities' },
    { num: 6, label: lang === 'ta' ? 'அங்கீகாரம் & ஆவணங்கள்' : 'Legal & Approvals' },
    { num: 7, label: lang === 'ta' ? 'புகைப்படம் & வீடியோ' : 'Media & Video' },
    { num: 8, label: lang === 'ta' ? 'முன்னோட்டம் & சமர்ப்பிப்பு' : 'Review & Publish' },
  ];

  const handleNext = () => {
    setFormError(null);

    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 5) {
        setFormError(lang === 'ta' ? 'தலைப்பு குறைந்தபட்சம் 5 எழுத்துகள் இருக்க வேண்டும்.' : 'Please enter a clear property headline (minimum 5 characters).');
        return;
      }
      if (!description.trim() || description.trim().length < 15) {
        setFormError(lang === 'ta' ? 'விளக்கம் குறைந்தபட்சம் 15 எழுத்துகள் இருக்க வேண்டும்.' : 'Please enter a description (minimum 15 characters).');
        return;
      }
    } else if (currentStep === 2) {
      if (!locality.trim()) {
        setFormError(lang === 'ta' ? 'பகுதியைத் தேர்ந்தெடுக்கவும் அல்லது உள்ளிடவும்.' : 'Please select or enter the locality / area.');
        return;
      }
      if (!pincode.trim() || !/^[0-9]{6}$/.test(pincode.trim())) {
        setFormError(lang === 'ta' ? 'சரியான 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்.' : 'Please enter a valid 6-digit postal PIN code.');
        return;
      }
    } else if (currentStep === 3) {
      if (plotArea <= 0 && (!builtUpArea || builtUpArea <= 0) && (!superBuiltUpArea || superBuiltUpArea <= 0)) {
        setFormError(lang === 'ta' ? 'சொத்தின் அளவை உள்ளிடவும்.' : 'Please enter the property area.');
        return;
      }
    } else if (currentStep === 4) {
      if (price <= 0) {
        setFormError(lang === 'ta' ? 'விலை பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.' : 'Please enter a valid price greater than zero.');
        return;
      }
    } else if (currentStep === 7) {
      if (selectedPhotos.length === 0) {
        setFormError(lang === 'ta' ? 'குறைந்தபட்சம் 1 படம் பதிவேற்றப்பட வேண்டும்.' : 'Please upload at least 1 photograph of the property.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 8));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setFormError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Category switch confirmation handler
  const handleCategorySelect = (newCat: PropertyCategory) => {
    if (newCat === category) return;
    // Check if user has entered category-specific fields that might reset
    const hasEnteredCategoryData = Boolean(
      plotLength ||
      plotWidth ||
      isCornerPlot ||
      builtUpArea ||
      superBuiltUpArea ||
      cropType ||
      powerLoadKw
    );

    if (hasEnteredCategoryData) {
      setPendingCategoryChange(newCat);
      setShowCategoryConfirmModal(true);
    } else {
      setCategory(newCat);
    }
  };

  const confirmCategoryChange = () => {
    if (pendingCategoryChange) {
      setCategory(pendingCategoryChange);
      // Reset only category-specific attributes, preserving common ones
      setPlotLength('');
      setPlotWidth('');
      setIsCornerPlot(false);
      setBuiltUpArea('');
      setSuperBuiltUpArea('');
      setCarpetArea('');
      setCropType('');
      setPowerLoadKw('');
      setFrontageFeet('');
    }
    setShowCategoryConfirmModal(false);
    setPendingCategoryChange(null);
  };

  // ─── File Upload Handlers ────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    setPhotoUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image.`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 10MB limit.`);
        }
        const res = await api.uploadMedia(file);
        return res.url;
      });

      const urls = await Promise.all(uploadPromises);
      setSelectedPhotos(prev => [...prev, ...urls]);
    } catch (err: any) {
      setPhotoUploadError(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    setVideoUploadError(null);

    try {
      if (!file.type.startsWith('video/')) {
        throw new Error('Only MP4, WebM, or MOV video files are supported.');
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Video file size exceeds the 50MB maximum limit.');
      }
      const res = await api.uploadVideo(file);
      setVideoUrl(res.url);
      setVideoType('direct');
      showDraftToast('Video uploaded successfully!');
    } catch (err: any) {
      setVideoUploadError(err.message || 'Video upload failed.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleFloorPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingFloorPlan(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const res = await api.uploadMedia(file);
        return res.url;
      });
      const urls = await Promise.all(uploadPromises);
      setFloorPlans(prev => [...prev, ...urls]);
    } catch (err: any) {
      showDraftToast('Floor plan upload failed.');
    } finally {
      setIsUploadingFloorPlan(false);
      e.target.value = '';
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    setDocUploadError(null);

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Document exceeds the 10MB limit.');
      }
      const res = await api.uploadDocument(file);
      const titleToUse = newDocTitle.trim() || `${newDocType} Document`;
      setUploadedDocuments(prev => [
        ...prev,
        {
          title: titleToUse,
          url: res.url,
          documentType: newDocType,
          isPrivate: true,
          uploadedAt: new Date().toISOString(),
        },
      ]);
      setNewDocTitle('');
      showDraftToast(`Uploaded private document: ${titleToUse}`);
    } catch (err: any) {
      setDocUploadError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  };

  // Reorder photos: make selected index the cover (index 0)
  const setAsCoverPhoto = (idx: number) => {
    if (idx === 0) return;
    setSelectedPhotos(prev => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  // ─── Payload Builder & Draft Persistence ───────────────────
  const buildPayload = (isDraft: boolean) => {
    return {
      title: title.trim() || (isDraft ? 'Untitled Draft Listing' : 'Property Listing'),
      tamilTitle: tamilTitle.trim() || undefined,
      description: description.trim() || (isDraft ? 'Draft description in progress.' : `${title} in ${locality}, ${district}.`),
      tamilDescription: tamilDescription.trim() || undefined,
      category,
      listingType,
      ownershipType: 'third-party' as const,
      price: price || 0,
      priceUnit: listingType === 'rent' ? '/ Month' : 'Total',
      priceBasis,
      negotiable,
      deposit: typeof deposit === 'number' && deposit > 0 ? deposit : undefined,
      maintenanceFee: typeof maintenanceFee === 'number' && maintenanceFee > 0 ? maintenanceFee : undefined,
      maintenanceFrequency: maintenanceFee ? maintenanceFrequency : undefined,
      possessionDate: possessionDate || undefined,

      address: address.trim() || `${locality}, ${district}`,
      district,
      locality: locality.trim() || district,
      pincode: pincode.trim(),
      state,
      landmark: landmark.trim() || undefined,
      coordinates: mapLocation.confirmed ? { lat: mapLocation.lat, lng: mapLocation.lng } : undefined,
      locationConfirmed: mapLocation.confirmed,
      locationSource: mapLocation.confirmed ? 'picker' : undefined,
      isApproximateLocation: mapLocation.isApproximate || false,

      plotArea: plotArea || 0,
      plotAreaUnit,
      plotLength: typeof plotLength === 'number' ? plotLength : undefined,
      plotWidth: typeof plotWidth === 'number' ? plotWidth : undefined,
      roadWidthFeet: roadWidthFeet || 30,
      roadType,
      isCornerPlot,
      isGatedLayout,
      boundaryWall,
      facing,
      furnishingStatus,
      constructionStatus,

      builtUpArea: typeof builtUpArea === 'number' && builtUpArea > 0 ? builtUpArea : undefined,
      carpetArea: typeof carpetArea === 'number' && carpetArea > 0 ? carpetArea : undefined,
      superBuiltUpArea: typeof superBuiltUpArea === 'number' && superBuiltUpArea > 0 ? superBuiltUpArea : undefined,
      bedrooms: (category === 'villas' || category === 'apartments' || category === 'independent-houses') ? bedrooms : undefined,
      bathrooms: (category === 'villas' || category === 'apartments' || category === 'independent-houses') ? bathrooms : undefined,
      balconies: (category === 'villas' || category === 'apartments' || category === 'independent-houses') ? balconies : undefined,
      floors: floors || undefined,
      floorNumber: typeof floorNumber === 'number' ? floorNumber : undefined,
      totalFloors: typeof totalFloors === 'number' ? totalFloors : undefined,
      parkingSpaces: typeof parkingSpaces === 'number' ? parkingSpaces : undefined,
      parkingType,
      hasLift,
      propertyAgeYears: typeof propertyAgeYears === 'number' ? propertyAgeYears : undefined,

      landUseClassification: category === 'agricultural-land' ? landUseClassification : undefined,
      irrigationSource: category === 'agricultural-land' ? irrigationSource : undefined,
      cropType: category === 'agricultural-land' ? cropType : undefined,
      soilType: category === 'agricultural-land' ? soilType : undefined,
      structuresOnLand: category === 'agricultural-land' ? structuresOnLand : undefined,

      commercialSubtype: category === 'commercial-properties' ? commercialSubtype : undefined,
      powerLoadKw: typeof powerLoadKw === 'number' ? powerLoadKw : undefined,
      frontageFeet: typeof frontageFeet === 'number' ? frontageFeet : undefined,
      ceilingHeightFeet: typeof ceilingHeightFeet === 'number' ? ceilingHeightFeet : undefined,
      suitableUse: category === 'commercial-properties' ? suitableUse : undefined,

      amenities: selectedAmenities.length > 0 ? selectedAmenities : ['Blacktop Road Access', 'Clear Title Patta'],
      waterSource,
      electricitySupply,

      approvalAuthority,
      approvalNumber: approvalNumber.trim() || undefined,
      reraId: reraId.trim() || undefined,
      legalDocuments: uploadedDocuments,

      images: selectedPhotos.length > 0 ? selectedPhotos : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      videoUrl: videoUrl.trim() || undefined,
      videoType: videoUrl ? videoType : undefined,
      videos: videoUrl ? [videoUrl] : [],
      floorPlans: floorPlans.length > 0 ? floorPlans : undefined,

      seller: {
        name: sellerName.trim() || 'Property Owner',
        type: sellerRole,
        phone: sellerPhone.trim() || '+91 98422 71000',
        email: sellerEmail.trim() || 'seller@groundsandgates.com',
        isCompanyRepresentative: false,
      },
      contactPreferences: {
        preferredTime: preferredContactHours,
        allowWhatsApp,
        phoneAvailable: true,
        siteVisitDays,
      },
      draftStep: currentStep,
      isDraft,
      publishingStatus: isDraft ? ('draft' as const) : ('pending-review' as const),
    };
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const payload = buildPayload(true);
      let saved: Property;
      if (editingReferenceId) {
        saved = await api.updateProperty(editingReferenceId, payload as any);
      } else {
        saved = await api.createProperty(payload as any);
        setEditingReferenceId(saved.id || (saved as any).referenceId);
      }
      showDraftToast(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (err: any) {
      showDraftToast(`Save draft notice: ${err.message || 'Error saving draft'}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Final checks
    if (!title.trim() || title.length < 5) {
      setFormError('Please provide a descriptive title (at least 5 characters).');
      setCurrentStep(1);
      setIsSubmitting(false);
      return;
    }
    if (!mapLocation.confirmed) {
      setFormError('Please confirm your property location on the map in Step 2.');
      setCurrentStep(2);
      setIsSubmitting(false);
      return;
    }
    if (selectedPhotos.length === 0) {
      setFormError('Please upload at least 1 property photograph in Step 7.');
      setCurrentStep(7);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = buildPayload(false);
      let result: Property;
      if (editingReferenceId) {
        result = await api.updateProperty(editingReferenceId, payload as any);
      } else {
        result = await api.createProperty(payload as any);
      }
      onListingCreated(result);
      setSubmittedPropertyId(result.id || (result as any).referenceId || (result as any).slug);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit property for review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Post-Submission Confirmation Screen ─────────────────────
  if (submittedPropertyId) {
    return (
      <div className="bg-[#FAF8F2] min-h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-stone-200 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            {isEditMode ? 'Listing Updated' : 'Submitted for Legal Verification'}
          </span>

          <h2 className="text-2xl font-black text-[#18241B] mt-3">
            {isEditMode ? 'Listing Updated Successfully!' : t.postProperty.successTitle}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            {isEditMode
              ? 'Your updates have been securely saved and submitted to the verification desk.'
              : 'Your property has been registered. Our legal verification desk will inspect your documents and confirm title clearance before public promotion.'}
          </p>

          <div className="my-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Reference ID:</span>
              <span className="font-bold text-[#013E18]">{submittedPropertyId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Category:</span>
              <span className="font-bold capitalize">{category.replace(/-/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Location:</span>
              <span className="font-bold">{locality}, {district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Verification Status:</span>
              <span className="font-bold text-amber-700">Under Review</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate(`seller/preview/${submittedPropertyId}`)}
              className="flex-1 py-3 bg-[#013E18] text-[#F5F2E9] rounded-xl font-bold text-xs hover:bg-[#00280f] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Preview My Submission
            </button>
            <button
              onClick={() => onNavigate(`edit-property/${submittedPropertyId}`)}
              className="flex-1 py-3 bg-[#C99325] text-[#18241B] rounded-xl font-bold text-xs hover:bg-[#b5821f] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Edit Listing
            </button>
            <button
              onClick={() => onNavigate('seller/dashboard')}
              className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl font-bold text-xs hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Go to Seller Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Wizard Layout ──────────────────────────────────────
  return (
    <div className="bg-[#FAF8F2] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Draft Notification Toast */}
      {draftToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#013E18] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 border border-[#C99325]/40">
          <CheckCircleIcon sx={{ fontSize: 16, color: '#C99325' }} />
          <span>{draftToast}</span>
        </div>
      )}

      {/* Category Change Confirmation Modal */}
      {showCategoryConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-base mb-2">
              <WarningAmberIcon sx={{ fontSize: 24 }} />
              <span>Change Property Category?</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Switching from <strong className="capitalize">{category.replace(/-/g, ' ')}</strong> to <strong className="capitalize">{pendingCategoryChange?.replace(/-/g, ' ')}</strong> will reset category-specific fields (dimensions, BHK, crops, etc.). Common fields like title, location, pricing, media, and seller details will be preserved.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryConfirmModal(false);
                  setPendingCategoryChange(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50"
              >
                Keep Current Category
              </button>
              <button
                type="button"
                onClick={confirmCategoryChange}
                className="px-4 py-2 rounded-xl bg-[#013E18] text-white text-xs font-bold hover:bg-[#00280f]"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Existing Draft Resume Banner */}
        {existingDraftAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AutoAwesomeIcon sx={{ fontSize: 20, color: '#C99325' }} />
              <div>
                <strong>Unsaved Draft Found:</strong> "{existingDraftAlert.title}" (Step {existingDraftAlert.step} of 8). Would you like to resume where you left off?
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResumeDraft}
                className="px-3.5 py-1.5 rounded-lg bg-[#013E18] text-white font-bold hover:bg-[#00280f] cursor-pointer"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={() => setExistingDraftAlert(null)}
                className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold cursor-pointer"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Header with Title and "Save Draft" Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#C99325] bg-[#C99325]/10 px-2.5 py-0.5 rounded-full mb-1">
              <span>{isEditMode ? 'Listing Editor' : 'Seller Listing Wizard'}</span>
              <span>•</span>
              <span>Step {currentStep} of 8</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#18241B] tracking-tight">
              {isEditMode ? 'Edit Property Listing' : t.postProperty.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              {isEditMode
                ? 'Update specifications, pricing, media, or map location for your listing.'
                : t.postProperty.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#013E18] text-stone-800 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSavingDraft ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16, color: '#C99325' }} />}
              <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="md:hidden bg-white rounded-2xl p-4 border border-stone-200 shadow-xs mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
            <span className="flex items-center gap-1.5 text-[#013E18]">
              <span className="w-5 h-5 rounded-full bg-[#013E18] text-white flex items-center justify-center text-[10px] font-black">
                {currentStep}
              </span>
              <span>{stepTitles[currentStep - 1]?.label}</span>
            </span>
            <span className="text-stone-400">Step {currentStep} of 8</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#013E18] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop 8-Step Interactive Progress Tracker */}
        <div className="hidden md:block bg-white rounded-2xl p-3 border border-stone-200 shadow-xs mb-8 overflow-x-auto">
          <div className="flex items-center min-w-[720px] justify-between">
            {stepTitles.map((s, idx) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s.num)}
                    className={`flex items-center gap-2 text-left cursor-pointer transition-all p-1.5 rounded-xl ${
                      isCurrent
                        ? 'text-[#013E18] font-bold bg-[#013E18]/5'
                        : isPassed
                        ? 'text-emerald-800 font-semibold'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-[#013E18] text-white ring-2 ring-[#C99325]'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {isPassed ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : s.num}
                    </div>
                    <span className="text-xs whitespace-nowrap">{s.label}</span>
                  </button>
                  {idx < stepTitles.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${currentStep > s.num ? 'bg-emerald-400' : 'bg-stone-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
            <WarningAmberIcon sx={{ fontSize: 18 }} />
            <span>{formError}</span>
          </div>
        )}

        {/* ─── STEP CONTENT ──────────────────────────────────────── */}
        <form onSubmit={handleFinalSubmit} className="space-y-6">

          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                1. Basic Property Details
              </h2>

              {/* Transaction Type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Transaction Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setListingType('buy')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      listingType === 'buy'
                        ? 'border-[#013E18] bg-[#013E18] text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Sell Property (Outright Sale)
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType('rent')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      listingType === 'rent'
                        ? 'border-[#013E18] bg-[#013E18] text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Rent / Lease Property
                  </button>
                </div>
              </div>

              {/* Property Category */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Property Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        category === cat.id
                          ? 'border-[#013E18] bg-[#013E18]/5 text-[#013E18] ring-2 ring-[#013E18]'
                          : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{cat.name}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{cat.tamilName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seller Role */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  You are Listing as <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-lg">
                  {[
                    { id: 'owner', label: 'Property Owner' },
                    { id: 'builder', label: 'Builder / Developer' },
                    { id: 'agent', label: 'Certified Agent' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSellerRole(role.id as SellerType)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        sellerRole === role.id
                          ? 'border-[#013E18] bg-[#013E18] text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline / Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Property Headline (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 5 Cents DTCP Approved Villa Plot near KGISL Campus, Saravanampatti"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#013E18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    தலைப்பு (Tamil - விருப்பத்தேர்வு)
                  </label>
                  <input
                    type="text"
                    value={tamilTitle}
                    onChange={(e) => setTamilTitle(e.target.value)}
                    placeholder="எ.கா., சரவணம்பட்டியில் 5 சென்ட் DTCP அப்ரூவ்ட் மனை"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#013E18]"
                  />
                </div>
              </div>

              {/* Project / Layout Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Gated Layout / Project / Building Name (Optional)
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Green Valley Enclave Phase 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#013E18]"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Detailed Overview (English) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe surrounding developments, road access, frontage, soil type, and title pedigree..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#013E18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    முழு விவரம் (Tamil - விருப்பத்தேர்வு)
                  </label>
                  <textarea
                    rows={4}
                    value={tamilDescription}
                    onChange={(e) => setTamilDescription(e.target.value)}
                    placeholder="சொத்தின் அணுகுசாலை, நீர் ஆதாரம், மின் இணைப்பு மற்றும் பட்டா விவரங்கள்..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#013E18]"
                  />
                </div>
              </div>

              {/* Construction status (if residential/commercial building) */}
              {(category === 'villas' || category === 'apartments' || category === 'independent-houses' || category === 'commercial-properties') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Construction Status
                    </label>
                    <select
                      value={constructionStatus}
                      onChange={(e) => setConstructionStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                    >
                      <option value="ready-to-move">Ready to Move / Completed</option>
                      <option value="under-construction">Under Construction</option>
                      <option value="new-launch">New Launch / Pre-Launch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Furnishing Status
                    </label>
                    <select
                      value={furnishingStatus}
                      onChange={(e) => setFurnishingStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="fully-furnished">Fully Furnished</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Address and Map Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>2. Address & Confirmed Map Coordinates</span>
                <span className="text-xs text-stone-500 font-normal">Leaflet + Geoapify GIS</span>
              </h2>

              {/* District & Locality (Dependent selection) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setLocality('');
                      setPincode('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                  >
                    {districtOptions.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.name} ({d.tamilName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Locality / Area <span className="text-rose-500">*</span>
                  </label>
                  {localityOptions.length > 0 ? (
                    <select
                      value={locality}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocality(val);
                        const matched = localityOptions.find(l => l.name === val || l.code === val);
                        if (matched?.metadata?.pinCode) setPincode(matched.metadata.pinCode);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                    >
                      <option value="">-- Select Locality --</option>
                      {localityOptions.map((l) => (
                        <option key={l.code} value={l.name}>
                          {l.name} {l.nameTa ? `(${l.nameTa})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Saravanampatti"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                    />
                  )}
                </div>
              </div>

              {/* PIN Code & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Postal PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="641035"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Prominent Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g., Near KGISL Tech Park, Opposite Indian Oil"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Complete Street / Survey Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot No. 42, Green Avenue, SF No. 248/1A..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                />
              </div>

              {/* Interactive Map Picker */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Confirm Pin on Geographic Map <span className="text-rose-500">*</span>
                </label>
                <PropertyLocationPicker
                  value={mapLocation}
                  onChange={(val) => {
                    setMapLocation(val);
                    if (val.address && !address) setAddress(val.address);
                    if (val.locality && !locality) setLocality(val.locality);
                    if (val.pincode && !pincode) setPincode(val.pincode);
                  }}
                  lang={lang}
                />
              </div>

              {/* Location Privacy Preferences */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-800">Public Location Privacy</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Show approximate locality to buyers on the public map instead of the exact pinpoint marker.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapLocation.isApproximate || false}
                    onChange={(e) => setMapLocation(prev => ({ ...prev, isApproximate: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#013E18]"></div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Category-Specific Specifications */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>3. Specifications: <span className="text-[#013E18] capitalize">{category.replace(/-/g, ' ')}</span></span>
                <span className="text-xs text-[#C99325] font-bold uppercase tracking-wider">Tailored Fields</span>
              </h2>

              {/* PLOTS (Residential Plots) */}
              {category === 'residential-plots' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Plot Area <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={plotArea}
                        onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Area Unit
                      </label>
                      <select
                        value={plotAreaUnit}
                        onChange={(e) => setPlotAreaUnit(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                      >
                        <option value="cents">Cents (~435.6 sq.ft each)</option>
                        <option value="sq.ft">Square Feet (sq.ft)</option>
                        <option value="acres">Acres (100 Cents)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Plot Length (Feet)
                      </label>
                      <input
                        type="number"
                        value={plotLength}
                        onChange={(e) => setPlotLength(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="e.g. 60"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Plot Width / Frontage (Feet)
                      </label>
                      <input
                        type="number"
                        value={plotWidth}
                        onChange={(e) => setPlotWidth(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="e.g. 36.3"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Approach Road Width (Feet)
                      </label>
                      <input
                        type="number"
                        value={roadWidthFeet}
                        onChange={(e) => setRoadWidthFeet(parseInt(e.target.value, 10) || 30)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Road Surface Type
                      </label>
                      <select
                        value={roadType}
                        onChange={(e) => setRoadType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        <option value="tar">Tar (Blacktop)</option>
                        <option value="concrete">Concrete / Paver Blocks</option>
                        <option value="gravel">Gravel / Metal Road</option>
                        <option value="mud">Mud / Dirt Road</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Facing Direction
                      </label>
                      <select
                        value={facing}
                        onChange={(e) => setFacing(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        {facingOptions.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Checkbox toggles for plots */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCornerPlot}
                        onChange={(e) => setIsCornerPlot(e.target.checked)}
                        className="rounded text-[#013E18] focus:ring-[#013E18] w-4 h-4"
                      />
                      <span className="text-xs font-bold text-stone-700">Corner Property</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGatedLayout}
                        onChange={(e) => setIsGatedLayout(e.target.checked)}
                        className="rounded text-[#013E18] focus:ring-[#013E18] w-4 h-4"
                      />
                      <span className="text-xs font-bold text-stone-700">Gated Layout</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boundaryWall}
                        onChange={(e) => setBoundaryWall(e.target.checked)}
                        className="rounded text-[#013E18] focus:ring-[#013E18] w-4 h-4"
                      />
                      <span className="text-xs font-bold text-stone-700">Boundary Wall Erected</span>
                    </label>
                  </div>
                </div>
              )}

              {/* VILLAS / HOUSES */}
              {(category === 'villas' || category === 'independent-houses') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Plot Land Area (Cents)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={plotArea}
                        onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Built-Up Area (sq.ft) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={builtUpArea}
                        onChange={(e) => setBuiltUpArea(parseFloat(e.target.value) || '')}
                        placeholder="e.g. 2400"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Carpet Area (sq.ft)
                      </label>
                      <input
                        type="number"
                        value={carpetArea}
                        onChange={(e) => setCarpetArea(parseFloat(e.target.value) || '')}
                        placeholder="e.g. 2000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Bedrooms (BHK)
                      </label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Bathrooms
                      </label>
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Bathrooms</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Floors
                      </label>
                      <input
                        type="number"
                        value={floors}
                        onChange={(e) => setFloors(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Facing
                      </label>
                      <select
                        value={facing}
                        onChange={(e) => setFacing(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        {facingOptions.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Car Parking Spaces
                      </label>
                      <input
                        type="number"
                        value={parkingSpaces}
                        onChange={(e) => setParkingSpaces(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Parking Type
                      </label>
                      <select
                        value={parkingType}
                        onChange={(e) => setParkingType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        <option value="covered">Covered Portico</option>
                        <option value="open">Open Driveway</option>
                        <option value="none">No Parking</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Property Age (Years)
                      </label>
                      <input
                        type="number"
                        value={propertyAgeYears}
                        onChange={(e) => setPropertyAgeYears(e.target.value ? parseInt(e.target.value, 10) : '')}
                        placeholder="0 for brand new"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* APARTMENTS */}
              {category === 'apartments' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Super Built-Up Area (sq.ft) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={superBuiltUpArea}
                        onChange={(e) => setSuperBuiltUpArea(parseFloat(e.target.value) || '')}
                        placeholder="e.g. 1450"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Carpet Area (sq.ft)
                      </label>
                      <input
                        type="number"
                        value={carpetArea}
                        onChange={(e) => setCarpetArea(parseFloat(e.target.value) || '')}
                        placeholder="e.g. 1150"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Configuration
                      </label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-bold"
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Bathrooms
                      </label>
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Bathrooms</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Floor Number
                      </label>
                      <input
                        type="number"
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(e.target.value ? parseInt(e.target.value, 10) : '')}
                        placeholder="e.g. 4"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Total Floors
                      </label>
                      <input
                        type="number"
                        value={totalFloors}
                        onChange={(e) => setTotalFloors(e.target.value ? parseInt(e.target.value, 10) : '')}
                        placeholder="e.g. 12"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasLift}
                        onChange={(e) => setHasLift(e.target.checked)}
                        className="rounded text-[#013E18] focus:ring-[#013E18] w-4 h-4"
                      />
                      <span>Passenger Lift in Tower</span>
                    </label>
                  </div>
                </div>
              )}

              {/* AGRICULTURAL LAND */}
              {category === 'agricultural-land' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Total Farmland Area <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={plotArea}
                        onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Measurement Unit
                      </label>
                      <select
                        value={plotAreaUnit}
                        onChange={(e) => setPlotAreaUnit(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                      >
                        <option value="acres">Acres (100 Cents)</option>
                        <option value="cents">Cents</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Classification (வகைப்பாடு)
                      </label>
                      <select
                        value={landUseClassification}
                        onChange={(e) => setLandUseClassification(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                      >
                        <option value="garden-land">தோட்டம் (Garden Land / Thottam)</option>
                        <option value="wet-land">நன்செய் (Wet Land / Nanjai)</option>
                        <option value="dry-land">புன்செய் (Dry Land / Punjai)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Soil Type (மண் வகை)
                      </label>
                      <select
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        <option value="Red Soil">செம்மண் (Fertile Red Soil)</option>
                        <option value="Black Soil">கரிசல் மண் (Black Soil)</option>
                        <option value="Alluvial Soil">வண்டல் மண் (Alluvial)</option>
                        <option value="Loamy Sand">சரளை மண் (Loamy Sand)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Standing Crops / Plantation
                      </label>
                      <input
                        type="text"
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        placeholder="e.g. 450 Yielding Coconut Trees, Drip"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COMMERCIAL */}
              {category === 'commercial-properties' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Commercial Subtype
                      </label>
                      <select
                        value={commercialSubtype}
                        onChange={(e) => setCommercialSubtype(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-bold"
                      >
                        <option value="office">Grade-A Office / IT Park</option>
                        <option value="retail">Retail Showroom / Commercial Building</option>
                        <option value="warehouse">Industrial Warehouse / Godown</option>
                        <option value="industrial">Factory / Industrial Shed</option>
                        <option value="land">Commercial Land / Highway Plot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Built-Up Area (sq.ft)
                      </label>
                      <input
                        type="number"
                        value={builtUpArea}
                        onChange={(e) => setBuiltUpArea(parseFloat(e.target.value) || '')}
                        placeholder="e.g. 5000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Power Load Sanctioned (KW)
                      </label>
                      <input
                        type="number"
                        value={powerLoadKw}
                        onChange={(e) => setPowerLoadKw(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="e.g. 65"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Road Frontage Width (Feet)
                      </label>
                      <input
                        type="number"
                        value={frontageFeet}
                        onChange={(e) => setFrontageFeet(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="e.g. 80"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Clear Ceiling Height (Feet)
                      </label>
                      <input
                        type="number"
                        value={ceilingHeightFeet}
                        onChange={(e) => setCeilingHeightFeet(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="e.g. 14"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Pricing and Availability */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                4. Pricing & Availability
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Expected Amount (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-base font-black text-[#013E18]"
                  />
                  <div className="text-xs text-stone-500 font-semibold mt-1">
                    Display: {formatPriceINR(price, listingType, priceBasis)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Price Calculation Basis
                  </label>
                  <select
                    value={priceBasis}
                    onChange={(e) => setPriceBasis(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                  >
                    <option value="total">Total Outright Price</option>
                    <option value="per_cent">Per Cent (Land)</option>
                    <option value="per_sqft">Per Square Foot</option>
                    <option value="per_acre">Per Acre</option>
                    <option value="per_month">Per Month (Rent / Lease)</option>
                  </select>
                </div>
              </div>

              {/* Negotiable switch */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="negToggle"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded text-[#013E18] focus:ring-[#013E18] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="negToggle" className="text-xs font-bold text-stone-800 cursor-pointer">
                  Price is Negotiable during direct face-to-face inspection
                </label>
              </div>

              {/* Deposit & Maintenance for rentals/leases */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Optional advance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Monthly Maintenance Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Possession Availability Date
                  </label>
                  <input
                    type="date"
                    value={possessionDate}
                    onChange={(e) => setPossessionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Amenities and Utilities */}
          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>5. Master-Backed Amenities & Utilities</span>
                <span className="text-xs text-stone-500 font-normal">Select all available features</span>
              </h2>

              {/* Amenities Grid */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Key Infrastructure & Community Amenities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {availableAmenitiesList.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          setSelectedAmenities(prev =>
                            isSelected ? prev.filter(a => a !== amenity) : [...prev, amenity]
                          );
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#013E18] bg-[#013E18]/5 text-[#013E18] font-bold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-medium'
                        }`}
                      >
                        <span className="text-xs">{amenity}</span>
                        {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: '#013E18' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Water and Electricity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Water Supply Sources
                  </label>
                  <input
                    type="text"
                    value={waterSource.join(', ')}
                    onChange={(e) => setWaterSource(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g. Borewell 600ft, Corporation Siruvani Water"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Separate multiple sources with commas</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Electricity Supply
                  </label>
                  <input
                    type="text"
                    value={electricitySupply}
                    onChange={(e) => setElectricitySupply(e.target.value)}
                    placeholder="e.g. EB 3-Phase Connection, DG Backup"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Approvals and Private Documents Upload */}
          {currentStep === 6 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>6. Legal Approvals & Private Title Documents</span>
                <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                  <LockIcon sx={{ fontSize: 14 }} /> Private & Confidential
                </span>
              </h2>

              {/* Privacy Reassurance Alert Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
                <VerifiedUserIcon sx={{ fontSize: 20, color: '#013E18', shrink: 0, mt: '2px' }} />
                <div>
                  <strong className="block font-bold">100% Secure & Private Title Inspection Desk:</strong>
                  Documents uploaded here (Patta, parent title deeds, layout approval orders) are stored in an encrypted vault. They are accessible exclusively to the Grounds & Gates legal verification team and are <strong>NEVER published or shared with public visitors</strong>.
                </div>
              </div>

              {/* Approval Authority & Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Planning Authority
                  </label>
                  <select
                    value={approvalAuthority}
                    onChange={(e) => setApprovalAuthority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-semibold"
                  >
                    <option value="DTCP">DTCP Approved Layout</option>
                    <option value="CMDA">CMDA Approved</option>
                    <option value="RERA">RERA Registered</option>
                    <option value="Panchayat">Panchayat Approved</option>
                    <option value="Agricultural Patta">Agricultural Patta (Clear Title)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Approval Order / Sanction Ref No.
                  </label>
                  <input
                    type="text"
                    value={approvalNumber}
                    onChange={(e) => setApprovalNumber(e.target.value)}
                    placeholder="e.g. DTCP No. 128/2023"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    TN RERA Registration ID (if applicable)
                  </label>
                  <input
                    type="text"
                    value={reraId}
                    onChange={(e) => setReraId(e.target.value)}
                    placeholder="e.g. TN/11/Layout/2023/1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Document Uploader */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="text-xs font-bold text-stone-800">
                  Upload Verification Deed or Layout Certificate
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="Patta / Chitta">Patta / Chitta Transfer Copy</option>
                    <option value="Parent Title Deed">Parent Title Deed (30-Year Trace)</option>
                    <option value="DTCP / CMDA Order">DTCP / CMDA Sanction Plan</option>
                    <option value="RERA Certificate">RERA Registration Certificate</option>
                    <option value="Encumbrance Certificate (EC)">Nil Encumbrance Certificate (EC)</option>
                  </select>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Custom document label (optional)"
                    className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#013E18] text-white text-xs font-bold cursor-pointer hover:bg-[#00280f]">
                    <CloudUploadIcon sx={{ fontSize: 16 }} />
                    <span>Select PDF or Document (Max 10MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={handleDocUpload}
                      disabled={isUploadingDoc}
                      className="hidden"
                    />
                  </label>
                  {isUploadingDoc && <CircularProgress size={16} />}
                </div>

                {docUploadError && (
                  <div className="text-xs text-rose-600 font-semibold">{docUploadError}</div>
                )}
              </div>

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-stone-700">Uploaded Verification Documents ({uploadedDocuments.length})</div>
                  <div className="grid grid-cols-1 gap-2">
                    {uploadedDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <LockIcon sx={{ fontSize: 14, color: '#013E18' }} />
                          <span className="font-bold text-[#18241B]">{doc.title}</span>
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-semibold">
                            {doc.documentType}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedDocuments(prev => prev.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Photos, Video, and Floor Plans */}
          {currentStep === 7 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>7. Photos, Property Video & Floor Plans</span>
                <span className="text-xs text-stone-500 font-normal">High Quality Visuals</span>
              </h2>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Property Photographs <span className="text-rose-500">*</span> (At least 1 required)
                </label>
                <div className="p-6 border-2 border-dashed border-stone-300 hover:border-[#013E18] rounded-2xl text-center transition-colors bg-stone-50/50">
                  <CloudUploadIcon sx={{ fontSize: 36, color: '#013E18', mb: 1 }} />
                  <p className="text-xs text-stone-600 font-medium mb-2">
                    Upload JPEG, PNG, or WEBP photos (Max 10MB per file). Select multiple files at once.
                  </p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] text-xs font-bold hover:bg-[#00280f] transition-all cursor-pointer">
                    <span>Choose Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>
                  {isUploadingPhoto && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-600">
                      <CircularProgress size={16} />
                      <span>Uploading photographs...</span>
                    </div>
                  )}
                  {photoUploadError && (
                    <div className="text-xs text-rose-600 font-semibold mt-2">{photoUploadError}</div>
                  )}
                </div>

                {/* Uploaded Photos Grid */}
                {selectedPhotos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedPhotos.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-video bg-stone-100">
                        <img
                          src={resolveImageUrl(imgUrl)}
                          alt={`Property view ${idx + 1}`}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 ? (
                          <div className="absolute top-2 left-2 bg-[#013E18] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <StarIcon sx={{ fontSize: 12, color: '#C99325' }} /> Cover
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsCoverPhoto(idx)}
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition-opacity cursor-pointer"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full transition-opacity cursor-pointer"
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Tour Section (Direct Upload or YouTube/Vimeo Embed) */}
              <div className="pt-4 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Optional Video Tour (Direct MP4 Upload or YouTube/Vimeo Link)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Direct Video Upload */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <VideocamIcon sx={{ fontSize: 18, color: '#013E18' }} />
                      <span>Option A: Direct Video Upload</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Upload MP4, WebM, or MOV property walkthrough (up to 50MB).
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#013E18] text-stone-800 text-xs font-bold transition-all cursor-pointer">
                      <CloudUploadIcon sx={{ fontSize: 16, color: '#C99325' }} />
                      <span>Select Video File</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        disabled={isUploadingVideo}
                        className="hidden"
                      />
                    </label>
                    {isUploadingVideo && <CircularProgress size={14} />}
                    {videoUploadError && <div className="text-xs text-rose-600">{videoUploadError}</div>}
                  </div>

                  {/* External Allowlisted URL */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <VideocamIcon sx={{ fontSize: 18, color: '#C99325' }} />
                      <span>Option B: YouTube / Vimeo URL</span>
                    </div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVideoUrl(val);
                        if (val.includes('vimeo')) setVideoType('vimeo');
                        else if (val.includes('youtube') || val.includes('youtu.be')) setVideoType('youtube');
                        else setVideoType('direct');
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    />
                    <p className="text-[10px] text-stone-400">
                      Standard YouTube or Vimeo video links will automatically convert to clean embed format.
                    </p>
                  </div>
                </div>

                {/* Video Preview */}
                {videoUrl && (
                  <div className="mt-3 p-3 rounded-2xl bg-stone-100 flex items-center justify-between text-xs">
                    <span className="font-semibold truncate max-w-md">Attached Video: {videoUrl}</span>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove Video
                    </button>
                  </div>
                )}
              </div>

              {/* Floor Plans Section */}
              <div className="pt-4 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Architectural Floor Plans (Optional)
                </label>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#013E18] text-stone-800 text-xs font-bold transition-all cursor-pointer">
                  <ViewInArIcon sx={{ fontSize: 16, color: '#C99325' }} />
                  <span>Upload Floor Plan Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFloorPlanUpload}
                    disabled={isUploadingFloorPlan}
                    className="hidden"
                  />
                </label>
                {isUploadingFloorPlan && <CircularProgress size={14} className="ml-2" />}

                {floorPlans.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {floorPlans.map((fp, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-stone-200 aspect-video bg-white">
                        <img
                          src={resolveImageUrl(fp)}
                          alt={`Floor plan ${i + 1}`}
                          onError={handleImageError}
                          className="w-full h-full object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setFloorPlans(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full cursor-pointer"
                        >
                          <DeleteIcon sx={{ fontSize: 12 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: Contact Preferences & Live Interactive Preview */}
          {currentStep === 8 && (
            <div className="space-y-6">
              {/* Contact Preferences Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[#18241B] pb-3 border-b border-stone-100">
                  8. Contact Preferences & Enquiry Settings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Display Contact Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Direct Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={sellerEmail}
                      onChange={(e) => setSellerEmail(e.target.value)}
                      placeholder="seller@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Best Calling Hours
                    </label>
                    <input
                      type="text"
                      value={preferredContactHours}
                      onChange={(e) => setPreferredContactHours(e.target.value)}
                      placeholder="e.g. 10:00 AM - 7:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="waToggle"
                      checked={allowWhatsApp}
                      onChange={(e) => setAllowWhatsApp(e.target.checked)}
                      className="rounded text-[#013E18] focus:ring-[#013E18] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="waToggle" className="text-xs font-bold text-stone-800 cursor-pointer flex items-center gap-1.5">
                      <WhatsAppIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                      <span>Allow WhatsApp Enquiries from Verified Buyers</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Interactive Property Details Preview Banner */}
              <div className="bg-[#FAF8F2] rounded-3xl p-6 sm:p-8 border-2 border-[#C99325]/30 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <AutoAwesomeIcon sx={{ fontSize: 22, color: '#C99325' }} />
                    <span className="text-base font-black text-[#18241B]">
                      Live Property Details Preview
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-stone-500">
                    Matches official layout exactly
                  </span>
                </div>

                {/* Preview Banner: Title & Price */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C99325] bg-[#C99325]/10 px-2 py-0.5 rounded">
                          {category.replace(/-/g, ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-[#013E18] bg-[#013E18]/10 px-2 py-0.5 rounded uppercase">
                          For {listingType}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {approvalAuthority}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#18241B]">{title}</h3>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <LocationOnIcon sx={{ fontSize: 14, color: '#C99325' }} />
                        <span>{address || `${locality}, ${district}, Tamil Nadu - ${pincode}`}</span>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-2xl font-black text-[#013E18]">
                        {formatPriceINR(price, listingType, priceBasis)}
                      </div>
                      <div className="text-xs text-stone-500 font-semibold mt-0.5">
                        {negotiable ? 'Price Negotiable' : 'Fixed Direct Price'}
                      </div>
                    </div>
                  </div>

                  {/* Section Jump Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#C99325] hover:underline cursor-pointer"
                    >
                      <EditIcon sx={{ fontSize: 13 }} /> Edit Title & Category (Step 1)
                    </button>
                  </div>
                </div>

                {/* Preview: Gallery Photos */}
                {selectedPhotos.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-stone-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-stone-700">Gallery Preview ({selectedPhotos.length} Photos)</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(7)}
                        className="text-xs font-bold text-[#C99325] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <EditIcon sx={{ fontSize: 13 }} /> Edit Photos (Step 7)
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedPhotos.slice(0, 4).map((p, i) => (
                        <img
                          key={i}
                          src={resolveImageUrl(p)}
                          alt=""
                          onError={handleImageError}
                          className="w-full h-24 object-cover rounded-xl border border-stone-100"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview: Specifications Grid */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-stone-700">Specifications Table Preview</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-[#C99325] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <EditIcon sx={{ fontSize: 13 }} /> Edit Specs (Step 3)
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-stone-50">
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Area</div>
                      <div className="font-bold text-[#18241B]">{plotArea} {plotAreaUnit}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50">
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Facing</div>
                      <div className="font-bold text-[#18241B]">{facing}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50">
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Road Width</div>
                      <div className="font-bold text-[#18241B]">{roadWidthFeet} ft ({(roadType || 'tar').toUpperCase()})</div>
                    </div>
                  </div>
                </div>

                {/* Preview: Confirmed Map Location */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-stone-700">Geographic Confirmation</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#C99325] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <EditIcon sx={{ fontSize: 13 }} /> Edit Map (Step 2)
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#013E18' }} />
                    <span>Coordinates confirmed: <strong>{mapLocation.lat.toFixed(5)}, {mapLocation.lng.toFixed(5)}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BOTTOM NAVIGATION & SUBMISSION BAR ────────────────── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <SaveIcon sx={{ fontSize: 16, color: '#C99325' }} />
                <span>Save Draft</span>
              </button>

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#013E18] hover:bg-[#00280f] text-[#F5F2E9] font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={16} color="inherit" />
                      <span>Submitting Listing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#C99325' }} />
                      <span>{isEditMode ? 'Update Property Listing' : 'Submit Listing for Review'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
