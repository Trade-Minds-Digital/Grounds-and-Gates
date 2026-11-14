export const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'book-301',
    bookingNumber: 'GG-BKG-2026-001',
    propertyId: 'gg-cbe-plot-01',
    propertyTitle: 'DTCP & RERA Approved Grand Gated Villa Plot',
    customerId: 'cust-mohan-01',
    customerName: 'Mohanraj S.',
    leadId: 'lead-101',
    assignedEmployeeId: 'emp-senthil-01',
    tokenAmount: 200000,
    totalAmount: 3850000,
    bookingDate: '2026-03-03',
    registrationTargetDate: '2026-03-25',
    status: 'token-received' as const,
    paymentMethod: 'Net Banking / RTGS' as const,
    notes: 'Token advance confirmed via RTGS. Legal encumbrance certificate verified for 30 years.'
  },
  {
    id: 'book-302',
    bookingNumber: 'GG-BKG-2026-002',
    propertyId: 'gg-chn-apt-01',
    propertyTitle: 'Prime 3BHK Lifestyle High-Rise - Perungudi, OMR',
    customerId: 'cust-suresh-04',
    customerName: 'Suresh Kumar',
    leadId: 'lead-104',
    assignedEmployeeId: 'emp-arun-03',
    tokenAmount: 500000,
    totalAmount: 16500000,
    bookingDate: '2026-03-02',
    registrationTargetDate: '2026-04-10',
    status: 'documentation' as const,
    paymentMethod: 'Net Banking / RTGS' as const,
    notes: 'Draft sale agreement prepared. Tripartite agreement with HDFC bank in progress.'
  }
];
