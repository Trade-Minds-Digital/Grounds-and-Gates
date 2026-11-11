import { Property, PropertyFilterState, ListingType } from '../types/property';

/**
 * Formats Indian Rupee (INR) currency amounts cleanly into Crores, Lakhs, or Thousands.
 */
export function formatPriceINR(amount: number, listingType?: ListingType, priceUnit?: string): string {
  if (amount == null || isNaN(amount)) return '₹0';
  
  let formatted = '';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    formatted = `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    const lakhs = amount / 100000;
    formatted = `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)} Lakhs`;
  } else if (amount >= 1000) {
    formatted = `₹${amount.toLocaleString('en-IN')}`;
  } else {
    formatted = `₹${amount}`;
  }

  if (listingType === 'rent') {
    return `${formatted} / mo`;
  }

  if (priceUnit && priceUnit !== 'Total') {
    return `${formatted} ${priceUnit}`;
  }

  return formatted;
}

/**
 * Converts cents to square feet (1 cent = 435.6 sq.ft)
 */
export function centsToSqft(cents: number): number {
  return Math.round(cents * 435.6);
}

/**
 * Formats area representation in standard Tamil Nadu real estate units.
 */
export function formatArea(plotArea: number, unit: 'cents' | 'sq.ft' | 'acres', builtUpArea?: number): string {
  if (unit === 'cents') {
    const sqft = centsToSqft(plotArea);
    return `${plotArea} Cents (~${sqft.toLocaleString('en-IN')} sq.ft)`;
  } else if (unit === 'acres') {
    return `${plotArea} Acres (${(plotArea * 100).toFixed(0)} Cents)`;
  } else {
    return `${plotArea.toLocaleString('en-IN')} sq.ft`;
  }
}

/**
 * Normalizes search text for fuzzy matching.
 */
function normalize(str: string): string {
  return (str || '').toLowerCase().trim();
}

/**
 * Filters property listings according to filter criteria.
 */
export function filterProperties(properties: Property[], filter: Partial<PropertyFilterState>): Property[] {
  return properties.filter(prop => {
    // Search query
    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const q = normalize(filter.searchQuery);
      const matchesTitle = normalize(prop.title).includes(q) || normalize(prop.tamilTitle || '').includes(q);
      const matchesLocation = normalize(prop.location).includes(q) || normalize(prop.district).includes(q);
      const matchesLandmark = normalize(prop.landmark || '').includes(q);
      const matchesCategory = normalize(prop.category.replace('-', ' ')).includes(q);
      if (!matchesTitle && !matchesLocation && !matchesLandmark && !matchesCategory) {
        return false;
      }
    }

    // Listing Type (Buy / Rent)
    if (filter.listingType && filter.listingType !== 'all') {
      if (prop.listingType !== filter.listingType) return false;
    }

    // Category
    if (filter.category && filter.category !== 'all') {
      if (prop.category !== filter.category) return false;
    }

    // District
    if (filter.district && filter.district !== 'All' && filter.district.trim() !== '') {
      if (normalize(prop.district) !== normalize(filter.district)) return false;
    }

    // Locality
    if (filter.locality && filter.locality !== 'All' && filter.locality.trim() !== '') {
      if (normalize(prop.location) !== normalize(filter.locality)) return false;
    }

    // Price range
    if (filter.minPrice != null && prop.price < filter.minPrice) return false;
    if (filter.maxPrice != null && prop.price > filter.maxPrice) return false;

    // Area range
    if (filter.minArea != null) {
      const area = prop.builtUpArea || (prop.plotAreaUnit === 'cents' ? centsToSqft(prop.plotArea) : prop.plotArea);
      if (area < filter.minArea) return false;
    }
    if (filter.maxArea != null) {
      const area = prop.builtUpArea || (prop.plotAreaUnit === 'cents' ? centsToSqft(prop.plotArea) : prop.plotArea);
      if (area > filter.maxArea) return false;
    }

    // Bedrooms
    if (filter.bedrooms && filter.bedrooms !== 'all') {
      if ((prop.bedrooms || 0) < Number(filter.bedrooms)) return false;
    }

    // Bathrooms
    if (filter.bathrooms && filter.bathrooms !== 'all') {
      if ((prop.bathrooms || 0) < Number(filter.bathrooms)) return false;
    }

    // Facing
    if (filter.facing && filter.facing !== 'all') {
      if (prop.facing !== filter.facing) return false;
    }

    // Ownership Type (company vs third-party)
    if (filter.ownershipType && filter.ownershipType !== 'all') {
      if (prop.ownershipType !== filter.ownershipType) return false;
    }

    // Featured only
    if (filter.featuredOnly && !prop.featured) return false;

    return true;
  });
}

/**
 * Sorts properties according to chosen criteria.
 */
export function sortProperties(properties: Property[], sortBy: PropertyFilterState['sortBy'] = 'relevance'): Property[] {
  const list = [...properties];
  switch (sortBy) {
    case 'newest':
      return list.sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime());
    case 'price-low':
      return list.sort((a, b) => a.price - b.price);
    case 'price-high':
      return list.sort((a, b) => b.price - a.price);
    case 'area-low':
      return list.sort((a, b) => (a.plotArea || 0) - (b.plotArea || 0));
    case 'area-high':
      return list.sort((a, b) => (b.plotArea || 0) - (a.plotArea || 0));
    case 'relevance':
    default:
      // Featured and company listings prioritized, then newest
      return list.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.ownershipType === 'company' && b.ownershipType !== 'company') return -1;
        if (a.ownershipType !== 'company' && b.ownershipType === 'company') return 1;
        return new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime();
      });
  }
}

/**
 * Calculates differences across properties for side-by-side comparison.
 */
export function findPropertyDifferences(props: Property[]): string[] {
  if (props.length < 2) return [];
  const diffs: string[] = [];

  const prices = props.map(p => p.price);
  if (new Set(prices).size > 1) diffs.push('price');

  const categories = props.map(p => p.category);
  if (new Set(categories).size > 1) diffs.push('category');

  const ownerships = props.map(p => p.ownershipType);
  if (new Set(ownerships).size > 1) diffs.push('ownershipType');

  const facings = props.map(p => p.facing);
  if (new Set(facings).size > 1) diffs.push('facing');

  const areas = props.map(p => p.plotArea);
  if (new Set(areas).size > 1) diffs.push('plotArea');

  const bedrooms = props.map(p => p.bedrooms || 0);
  if (new Set(bedrooms).size > 1) diffs.push('bedrooms');

  return diffs;
}

export interface EmiBreakdown {
  monthlyEmi: number;
  principalAmount: number;
  totalInterest: number;
  totalPayment: number;
  principalPercentage: number;
  interestPercentage: number;
}

/**
 * Calculates standard Indian home loan EMI using the reducing balance formula.
 * @param principal Loan amount in INR
 * @param annualRate Annual interest rate in percent (e.g. 8.5)
 * @param tenureYears Loan tenure in years (e.g. 20)
 */
export function calculateEmi(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  if (annualRate <= 0) return Math.round(principal / (tenureYears * 12));

  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(emi);
}

/**
 * Calculates full loan repayment breakdown including interest and percentages.
 */
export function calculateLoanBreakdown(
  propertyPrice: number,
  downPaymentPercent: number,
  annualRate: number,
  tenureYears: number
): EmiBreakdown {
  const downPayment = Math.round((propertyPrice * downPaymentPercent) / 100);
  const principal = Math.max(0, propertyPrice - downPayment);
  const monthlyEmi = calculateEmi(principal, annualRate, tenureYears);
  const totalMonths = tenureYears * 12;
  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  const principalPercentage = totalPayment > 0 ? Math.round((principal / totalPayment) * 100) : 100;
  const interestPercentage = Math.max(0, 100 - principalPercentage);

  return {
    monthlyEmi,
    principalAmount: principal,
    totalInterest,
    totalPayment,
    principalPercentage,
    interestPercentage
  };
}
