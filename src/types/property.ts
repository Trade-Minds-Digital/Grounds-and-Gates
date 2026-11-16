export type ListingType = 'buy' | 'rent';

export type PropertyCategory = 
  | 'residential-plots'
  | 'agricultural-land'
  | 'independent-houses'
  | 'villas'
  | 'apartments'
  | 'commercial-properties';

export type OwnershipType = 'company' | 'third-party';

export type SellerType = 'company' | 'owner' | 'agent' | 'builder';

export type FacingDirection = 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export type ListingStatus = 'active' | 'under-negotiation' | 'sold' | 'pending-review';

export interface SellerInfo {
  name: string;
  type: SellerType;
  phone: string;
  email: string;
  experienceYears?: number;
  totalListings?: number;
  isCompanyRepresentative?: boolean;
  responseTimeMinutes?: number;
  avatarUrl?: string;
  badgeTitle?: string;
}

export interface NearbyFacility {
  name: string;
  distance: string;
  type: 'school' | 'hospital' | 'transit' | 'shopping' | 'airport' | 'it-hub';
}

export interface Property {
  id: string;
  _id?: string;
  referenceId?: string;
  slug: string;
  title: string;
  tamilTitle?: string;
  description: string;
  tamilDescription?: string;
  category: PropertyCategory;
  listingType: ListingType;
  ownershipType: OwnershipType;
  price: number; // In INR Rupees
  priceUnit: string; // e.g., 'Total', '/ Month', '/ Cent', '/ Sq.ft'
  negotiable: boolean;
  
  // Location
  location: string; // Locality / Area
  locality?: string;
  district: string; // e.g., 'Coimbatore', 'Chennai', etc.
  state: string; // Tamil Nadu
  pincode: string;
  address: string;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  locationGeo?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] in GeoJSON order
  };
  locationConfirmed?: boolean;
  locationConfirmedAt?: string;
  locationSource?: 'picker' | 'manual' | 'geocoded';
  isApproximateLocation?: boolean;
  placeId?: string;
  distanceKm?: number;
  distanceLabel?: string;
  landmark?: string;
  
  // Sizing & Specs
  plotArea: number; // In sq.ft or cents
  plotAreaUnit: 'cents' | 'sq.ft' | 'acres';
  builtUpArea?: number; // In sq.ft
  builtUpAreaUnit?: 'sq.ft';
  carpetArea?: number;
  superBuiltUpArea?: number;
  plotLength?: number;
  plotWidth?: number;
  roadType?: 'tar' | 'concrete' | 'gravel' | 'mud';
  isCornerPlot?: boolean;
  isGatedLayout?: boolean;
  boundaryWall?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floors?: number;
  floorNumber?: number;
  totalFloors?: number;
  facing: FacingDirection;
  furnishingStatus?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  parkingSpaces?: number;
  parkingType?: 'covered' | 'open' | 'none';
  hasLift?: boolean;
  roadWidthFeet?: number;
  approvalAuthority?: 'DTCP' | 'CMDA' | 'RERA' | 'Panchayat' | 'Agricultural Patta';
  approvalNumber?: string;
  reraId?: string;
  waterSource?: string[];
  electricitySupply?: string;
  ageOfPropertyYears?: number;
  propertyAgeYears?: number;
  
  // Category-specific
  landUseClassification?: 'dry-land' | 'wet-land' | 'garden-land';
  irrigationSource?: string[];
  cropType?: string;
  structuresOnLand?: string[];
  soilType?: string;
  commercialSubtype?: 'office' | 'retail' | 'warehouse' | 'industrial' | 'land';
  powerLoadKw?: number;
  frontageFeet?: number;
  ceilingHeightFeet?: number;
  suitableUse?: string[];
  constructionStatus?: 'ready-to-move' | 'under-construction' | 'new-launch';
  possessionDate?: string;

  // Financials
  priceBasis?: 'total' | 'per_cent' | 'per_sqft' | 'per_acre' | 'per_month';
  deposit?: number;
  maintenanceFee?: number;
  maintenanceFrequency?: 'monthly' | 'quarterly' | 'annual';

  // Amenities & Features
  amenities: string[];
  nearbyFacilities: NearbyFacility[];
  
  // Media
  images: string[];
  videos?: string[];
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | 'vimeo';
  floorPlans?: string[];

  // Legal & Verification
  legalDocuments?: Array<{
    title: string;
    url: string;
    documentType: string;
    isPrivate: boolean;
    uploadedAt?: string;
  }>;

  // Contact preferences
  contactPreferences?: {
    preferredTime?: string;
    allowWhatsApp?: boolean;
    phoneAvailable?: boolean;
    siteVisitDays?: string[];
  };
  draftStep?: number;
  
  // Seller
  seller: SellerInfo;
  
  // Marketplace metadata
  projectId?: string;
  listingDate: string;
  status: ListingStatus;
  publishingStatus?: 'draft' | 'pending-review' | 'published' | 'rejected' | 'archived';
  featured: boolean;
  demoLabel: string;
  viewsCount?: number;
  enquiriesCount?: number;
  verified?: boolean;
  legalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  verificationStatus?: 'verified' | 'pending' | 'unverified';
}

export interface MapMarkerItem {
  id: string;
  slug: string;
  title: string;
  tamilTitle?: string;
  category: PropertyCategory;
  listingType: ListingType;
  price: number;
  priceUnit: string;
  locality: string;
  district: string;
  image: string;
  lat: number;
  lng: number;
  isApproximateLocation?: boolean;
  verified?: boolean;
}

export interface PropertyFilterState {
  searchQuery: string;
  listingType: ListingType | 'all';
  category: PropertyCategory | 'all';
  district: string;
  locality: string;
  minPrice: number | null;
  maxPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  bedrooms: number | 'all';
  bathrooms: number | 'all';
  facing: FacingDirection | 'all';
  ownershipType: OwnershipType | 'all';
  featuredOnly: boolean;
  nearLat?: number | null;
  nearLng?: number | null;
  radius?: number | null;
  bbox?: string | null;
  locationStatus?: 'all' | 'confirmed' | 'missing';
  sortBy: 'relevance' | 'newest' | 'price-low' | 'price-high' | 'area-low' | 'area-high' | 'distance';
}

export interface EnquirySubmission {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyLocation: string;
  fullName: string;
  phone: string;
  email: string;
  visitDate?: string;
  preferredTimeSlot?: string;
  message: string;
  submittedAt: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface LocationHub {
  id: string;
  name: string;
  tamilName: string;
  popularLocalities: string[];
  listingCount: number;
  imageUrl: string;
  description: string;
  isMetro?: boolean;
}

export interface CategoryInfo {
  id: PropertyCategory;
  name: string;
  tamilName: string;
  description: string;
  tamilDescription: string;
  typicalUnits: string;
  iconName: string;
  imageUrl: string;
}

export type LanguageCode = 'en' | 'ta';

export type UserRole =
  | 'super-admin'
  | 'admin'
  | 'sales-manager'
  | 'sales-executive'
  | 'listing-manager'
  | 'buyer'
  | 'seller'
  | 'owner'
  | 'agent'
  | 'developer'
  | 'company-admin';
