import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPriceINR, centsToSqft, formatArea, filterProperties, sortProperties, findPropertyDifferences, calculateEmi, calculateLoanBreakdown } from './propertyUtils';
import { Property } from '../types/property';

test('formatPriceINR correctly formats Lakhs, Crores and Thousands', () => {
  assert.equal(formatPriceINR(4500000), '₹45 Lakhs');
  assert.equal(formatPriceINR(18500000), '₹1.85 Cr');
  assert.equal(formatPriceINR(25000, 'rent'), '₹25,000 / mo');
  assert.equal(formatPriceINR(12000000, 'buy', 'Total'), '₹1.20 Cr');
});

test('centsToSqft accurately converts cents to square feet', () => {
  assert.equal(centsToSqft(1), 436);
  assert.equal(centsToSqft(5), 2178);
  assert.equal(centsToSqft(10), 4356);
});

test('formatArea handles cents, acres, and sq.ft units', () => {
  assert.match(formatArea(5, 'cents'), /5 Cents/);
  assert.match(formatArea(2, 'acres'), /2 Acres/);
  assert.match(formatArea(1500, 'sq.ft'), /1,500 sq.ft/);
});

const mockProperties: Property[] = [
  {
    id: 'prop-1',
    slug: 'coimbatore-plot',
    title: 'DTCP Approved Plot in Saravanampatti',
    tamilTitle: 'சரவணம்பட்டியில் மனை',
    description: 'Prime residential plot',
    category: 'residential-plots',
    listingType: 'buy',
    ownershipType: 'company',
    price: 3500000,
    priceUnit: 'Total',
    negotiable: true,
    location: 'Saravanampatti',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641035',
    address: 'Saravanampatti, Coimbatore',
    plotArea: 5,
    plotAreaUnit: 'cents',
    facing: 'North',
    amenities: ['Gated Community', 'Blacktop Road'],
    nearbyFacilities: [],
    images: ['https://images.unsplash.com/photo-1'],
    seller: {
      name: 'Grounds and Gates Official Desk',
      type: 'company',
      phone: '+91 98765 43210',
      email: 'sales@groundsandgates.com'
    },
    listingDate: '2026-03-01',
    status: 'active',
    featured: true,
    demoLabel: 'Demo Listing'
  },
  {
    id: 'prop-2',
    slug: 'chennai-villa',
    title: 'Luxury Villa in ECR',
    tamilTitle: 'ஈசிஆர் சொகுசு வில்லா',
    description: 'Beachside 4BHK Villa',
    category: 'villas',
    listingType: 'buy',
    ownershipType: 'third-party',
    price: 25000000,
    priceUnit: 'Total',
    negotiable: false,
    location: 'ECR',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600115',
    address: 'ECR, Chennai',
    plotArea: 8,
    plotAreaUnit: 'cents',
    bedrooms: 4,
    bathrooms: 4,
    facing: 'East',
    amenities: ['Private Pool', 'Solar Power'],
    nearbyFacilities: [],
    images: ['https://images.unsplash.com/photo-2'],
    seller: {
      name: 'Suresh Kumar',
      type: 'owner',
      phone: '+91 94444 11223',
      email: 'suresh@example.com'
    },
    listingDate: '2026-02-15',
    status: 'active',
    featured: false,
    demoLabel: 'Demo Listing'
  }
];

test('filterProperties matches query, category, district, and ownership', () => {
  const queryResult = filterProperties(mockProperties, { searchQuery: 'Saravanampatti' });
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].id, 'prop-1');

  const companyResult = filterProperties(mockProperties, { ownershipType: 'company' });
  assert.equal(companyResult.length, 1);
  assert.equal(companyResult[0].id, 'prop-1');

  const chennaiResult = filterProperties(mockProperties, { district: 'Chennai' });
  assert.equal(chennaiResult.length, 1);
  assert.equal(chennaiResult[0].id, 'prop-2');
});

test('sortProperties sorts by price ascending and descending', () => {
  const lowToHigh = sortProperties(mockProperties, 'price-low');
  assert.equal(lowToHigh[0].id, 'prop-1');
  assert.equal(lowToHigh[1].id, 'prop-2');

  const highToLow = sortProperties(mockProperties, 'price-high');
  assert.equal(highToLow[0].id, 'prop-2');
  assert.equal(highToLow[1].id, 'prop-1');
});

test('findPropertyDifferences identifies differences between compared listings', () => {
  const diffs = findPropertyDifferences(mockProperties);
  assert.ok(diffs.includes('price'));
  assert.ok(diffs.includes('category'));
  assert.ok(diffs.includes('ownershipType'));
  assert.ok(diffs.includes('facing'));
});

test('calculateEmi calculates accurate home loan EMI for Indian banks', () => {
  // ₹40,00,000 at 8.5% for 20 years
  const emi = calculateEmi(4000000, 8.5, 20);
  // Standard benchmark is ~₹34,713
  assert.ok(emi >= 34700 && emi <= 34725, `Expected ~34713, got ${emi}`);
});

test('calculateLoanBreakdown provides correct downpayment and interest shares', () => {
  const breakdown = calculateLoanBreakdown(5000000, 20, 8.5, 20);
  assert.equal(breakdown.principalAmount, 4000000);
  assert.ok(breakdown.monthlyEmi > 0);
  assert.ok(breakdown.totalInterest > 0);
  assert.equal(breakdown.principalPercentage + breakdown.interestPercentage, 100);
});
