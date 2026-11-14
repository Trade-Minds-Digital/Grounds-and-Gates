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
  district: string; // e.g., 'Coimbatore', 'Chennai', etc.
  state: string; // Tamil Nadu
  pincode: string;
  address: string;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  landmark?: string;
  
  // Sizing & Specs
  plotArea: number; // In sq.ft or cents
  plotAreaUnit: 'cents' | 'sq.ft' | 'acres';
  builtUpArea?: number; // In sq.ft
  builtUpAreaUnit?: 'sq.ft';
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  facing: FacingDirection;
  roadWidthFeet?: number;
  approvalAuthority?: 'DTCP' | 'CMDA' | 'RERA' | 'Panchayat' | 'Agricultural Patta';
  reraId?: string; // Clearly labeled demo
  waterSource?: string[];
  electricitySupply?: string;
  ageOfPropertyYears?: number;
  
  // Amenities & Features
  amenities: string[];
  nearbyFacilities: NearbyFacility[];
  
  // Media
  images: string[];
  
  // Seller
  seller: SellerInfo;
  
  // Marketplace metadata
  projectId?: string;
  listingDate: string;
  status: ListingStatus;
  featured: boolean;
  demoLabel: string; // 'Demo Listing'
  viewsCount?: number;
  enquiriesCount?: number;
  verified?: boolean;
  legalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  verificationStatus?: 'verified' | 'pending' | 'unverified';
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
  sortBy: 'relevance' | 'newest' | 'price-low' | 'price-high' | 'area-low' | 'area-high';
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
  | 'owner'
  | 'agent'
  | 'company-admin';
