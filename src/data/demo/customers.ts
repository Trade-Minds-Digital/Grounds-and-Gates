import { Customer } from '../../types/demo';

export const INITIAL_DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-mohan-01',
    fullName: 'Mohanraj S.',
    phone: '+91 98422 71000',
    email: 'mohanrajs0410@gmail.com',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    preferredCategories: ['residential-plots', 'villas'],
    budgetRange: { min: 3500000, max: 8000000 },
    enquiryIds: ['enq-seed-1', 'lead-101'],
    bookingIds: ['book-301'],
    createdDate: '2026-02-15'
  },
  {
    id: 'cust-anand-02',
    fullName: 'Anand Sundaram',
    phone: '+91 98402 11223',
    email: 'anand.sundaram@gmail.com',
    city: 'Chennai',
    state: 'Tamil Nadu',
    preferredCategories: ['villas', 'apartments'],
    budgetRange: { min: 20000000, max: 35000000 },
    enquiryIds: ['lead-102'],
    bookingIds: [],
    createdDate: '2026-02-20'
  },
  {
    id: 'cust-kavitha-03',
    fullName: 'Dr. Kavitha Selvan',
    phone: '+91 94431 88776',
    email: 'kavitha.dr@aims.org',
    city: 'Madurai',
    state: 'Tamil Nadu',
    preferredCategories: ['residential-plots', 'independent-houses'],
    budgetRange: { min: 5000000, max: 12000000 },
    enquiryIds: ['lead-103'],
    bookingIds: [],
    createdDate: '2026-02-25'
  },
  {
    id: 'cust-suresh-04',
    fullName: 'Suresh Kumar',
    phone: '+91 98840 99881',
    email: 'suresh.k@tcs.com',
    city: 'Chennai',
    state: 'Tamil Nadu',
    preferredCategories: ['apartments'],
    budgetRange: { min: 12000000, max: 18000000 },
    enquiryIds: ['lead-104'],
    bookingIds: ['book-302'],
    createdDate: '2026-02-28'
  },
  {
    id: 'cust-rajesh-05',
    fullName: 'Rajesh Subramanian',
    phone: '+91 97909 33221',
    email: 'rajesh.subramanian@gmail.com',
    city: 'Tiruppur',
    state: 'Tamil Nadu',
    preferredCategories: ['agricultural-land', 'residential-plots'],
    budgetRange: { min: 8000000, max: 20000000 },
    enquiryIds: ['lead-105'],
    bookingIds: [],
    createdDate: '2026-03-01'
  }
];
