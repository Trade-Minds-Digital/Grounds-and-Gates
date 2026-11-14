import { SiteVisit } from '../../types/demo';

export const INITIAL_DEMO_SITE_VISITS: SiteVisit[] = [
  {
    id: 'visit-201',
    leadId: 'lead-101',
    propertyId: 'gg-cbe-plot-01',
    propertyTitle: 'DTCP & RERA Approved Grand Gated Villa Plot',
    customerId: 'cust-mohan-01',
    customerName: 'Mohanraj S.',
    customerPhone: '+91 98422 71000',
    assignedEmployeeId: 'emp-senthil-01',
    date: '2026-03-05',
    timeSlot: 'morning',
    status: 'scheduled',
    notes: 'Client requested parent legal documents and survey map during site inspection.',
    transportProvided: true
  },
  {
    id: 'visit-202',
    leadId: 'lead-102',
    propertyId: 'gg-cbe-villa-01',
    propertyTitle: 'Ultra-Luxury 4BHK Smart Villa with Private Garden',
    customerId: 'cust-anand-02',
    customerName: 'Anand Sundaram',
    customerPhone: '+91 98402 11223',
    assignedEmployeeId: 'emp-senthil-01',
    date: '2026-03-07',
    timeSlot: 'afternoon',
    status: 'scheduled',
    notes: 'Executive walkthrough scheduled with lead architect on site.',
    transportProvided: true
  },
  {
    id: 'visit-203',
    leadId: 'lead-104',
    propertyId: 'gg-chn-apt-01',
    propertyTitle: 'Prime 3BHK Lifestyle High-Rise - Perungudi, OMR',
    customerId: 'cust-suresh-04',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 98840 99881',
    assignedEmployeeId: 'emp-arun-03',
    date: '2026-03-01',
    timeSlot: 'evening',
    status: 'completed',
    feedback: 'Extremely satisfied with club amenities, car parking space, and east-facing sea breeze.',
    notes: 'Client confirmed token payment post visit.',
    transportProvided: false
  }
];
