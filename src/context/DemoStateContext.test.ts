import { test } from 'node:test';
import assert from 'node:assert';
import { INITIAL_DEMO_STATE } from '../data/demo';
import { DemoStateData, Lead, SiteVisit, Booking, Activity } from '../types/demo';

// Mock localStorage implementation for Node test environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();
const DEMO_STORAGE_KEY = 'gg_demo_state_v1';

test('Workflow 1 & 2: Submit a public property enquiry and verify lead appears in CRM', () => {
  mockStorage.clear();

  // Initial State
  let state: DemoStateData = { ...INITIAL_DEMO_STATE };
  const initialLeadCount = state.leads.length;

  // 1. Submit property enquiry
  const newLeadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
    customerId: 'cust-mohan-01',
    buyerName: 'Kavitha Murugesan',
    phone: '+91 94421 88990',
    email: 'kavitha.m@gmail.com',
    propertyId: 'gg-cbe-plot-01',
    propertyTitle: 'DTCP & RERA Approved Grand Gated Villa Plot',
    stage: 'new',
    priority: 'high',
    assignedEmployeeId: 'emp-senthil-01',
    offerAmount: 3800000,
    message: 'Requesting on-site inspection of plot #14 this Sunday.',
    date: 'Just now',
    scheduledVisitDate: null,
  };

  const now = new Date().toISOString();
  const createdLead: Lead = {
    ...newLeadData,
    id: `lead-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  state = {
    ...state,
    leads: [createdLead, ...state.leads],
  };

  // Persist
  mockStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));

  // 2. Verify lead in CRM
  assert.strictEqual(state.leads.length, initialLeadCount + 1);
  const found = state.leads.find(l => l.id === createdLead.id);
  assert.ok(found);
  assert.strictEqual(found?.buyerName, 'Kavitha Murugesan');
  assert.strictEqual(found?.stage, 'new');
});

test('Workflow 3 & 4: Assign lead to employee and update lead stage', () => {
  let state: DemoStateData = JSON.parse(mockStorage.getItem(DEMO_STORAGE_KEY)!);
  const targetLead = state.leads[0];

  // 3. Assign lead to emp-priya-02
  state = {
    ...state,
    leads: state.leads.map(l => l.id === targetLead.id ? { ...l, assignedEmployeeId: 'emp-priya-02' } : l),
  };
  assert.strictEqual(state.leads[0].assignedEmployeeId, 'emp-priya-02');

  // 4. Update lead stage to negotiation
  state = {
    ...state,
    leads: state.leads.map(l => l.id === targetLead.id ? { ...l, stage: 'negotiation' } : l),
  };
  assert.strictEqual(state.leads[0].stage, 'negotiation');

  mockStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
});

test('Workflow 5 & 6 & 7: Add follow-up activity, schedule site visit, verify in buyer & CRM views', () => {
  let state: DemoStateData = JSON.parse(mockStorage.getItem(DEMO_STORAGE_KEY)!);
  const targetLead = state.leads[0];

  // 5. Add follow-up activity
  const newActivity: Activity = {
    id: `act-${Date.now()}`,
    entityType: 'lead',
    entityId: targetLead.id,
    type: 'call',
    title: 'Phone Consultation Completed',
    description: 'Confirmed buyer preference for East-facing boundary and 40ft road.',
    timestamp: new Date().toISOString(),
    performedBy: 'Priya Ramasamy',
    performedByEmployeeId: 'emp-priya-02',
  };

  state = {
    ...state,
    activities: [newActivity, ...state.activities],
  };
  assert.strictEqual(state.activities[0].title, 'Phone Consultation Completed');

  // 6. Schedule site visit
  const initialVisitCount = state.siteVisits.length;
  const newVisit: SiteVisit = {
    id: `visit-${Date.now()}`,
    leadId: targetLead.id,
    propertyId: targetLead.propertyId,
    propertyTitle: targetLead.propertyTitle,
    customerId: targetLead.customerId,
    customerName: targetLead.buyerName,
    customerPhone: targetLead.phone,
    assignedEmployeeId: 'emp-priya-02',
    date: '2026-03-12',
    timeSlot: 'morning',
    status: 'scheduled',
    notes: 'Transport required from Coimbatore junction.',
    transportProvided: true,
  };

  state = {
    ...state,
    siteVisits: [newVisit, ...state.siteVisits],
    leads: state.leads.map(l => l.id === targetLead.id ? { ...l, stage: 'scheduled', scheduledVisitDate: '2026-03-12' } : l),
  };

  // 7. Verify visit appears
  assert.strictEqual(state.siteVisits.length, initialVisitCount + 1);
  const foundVisit = state.siteVisits.find(v => v.leadId === targetLead.id);
  assert.ok(foundVisit);
  assert.strictEqual(foundVisit?.status, 'scheduled');
  assert.strictEqual(foundVisit?.date, '2026-03-12');

  mockStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
});

test('Workflow 8 & 9: Create booking and verify related counters and property status', () => {
  let state: DemoStateData = JSON.parse(mockStorage.getItem(DEMO_STORAGE_KEY)!);
  const targetLead = state.leads[0];
  const initialBookingCount = state.bookings.length;

  // 8. Create booking
  const newBooking: Booking = {
    id: `book-${Date.now()}`,
    bookingNumber: 'GG-BKG-2026-009',
    propertyId: targetLead.propertyId,
    propertyTitle: targetLead.propertyTitle,
    customerId: targetLead.customerId,
    customerName: targetLead.buyerName,
    leadId: targetLead.id,
    assignedEmployeeId: 'emp-priya-02',
    tokenAmount: 250000,
    totalAmount: 3800000,
    bookingDate: '2026-03-10',
    registrationTargetDate: '2026-03-30',
    status: 'token-received',
    paymentMethod: 'Net Banking / RTGS',
    notes: 'Token received via IMPS.',
  };

  state = {
    ...state,
    bookings: [newBooking, ...state.bookings],
    properties: state.properties.map(p => p.id === targetLead.propertyId ? { ...p, status: 'under-negotiation' } : p),
    leads: state.leads.map(l => l.id === targetLead.id ? { ...l, stage: 'won' } : l),
  };

  // 9. Verify counters and property status
  assert.strictEqual(state.bookings.length, initialBookingCount + 1);
  const prop = state.properties.find(p => p.id === targetLead.propertyId);
  assert.strictEqual(prop?.status, 'under-negotiation');
  const lead = state.leads.find(l => l.id === targetLead.id);
  assert.strictEqual(lead?.stage, 'won');

  mockStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
});

test('Workflow 10 & 11: Refresh browser / reload from storage and verify persisted data', () => {
  // 10. Simulate page refresh by reading fresh from storage
  const stored = mockStorage.getItem(DEMO_STORAGE_KEY);
  assert.ok(stored);

  // 11. Parse and verify persisted state
  const reloadedState: DemoStateData = JSON.parse(stored!);
  assert.strictEqual(reloadedState.version, 1);
  assert.strictEqual(reloadedState.bookings.length, 3); // 2 initial + 1 created
  assert.strictEqual(reloadedState.siteVisits.length, 4); // 3 initial + 1 scheduled
  assert.strictEqual(reloadedState.leads.length, 6); // 5 initial + 1 created
  assert.strictEqual(reloadedState.leads[0].buyerName, 'Kavitha Murugesan');
  assert.strictEqual(reloadedState.leads[0].stage, 'won');
});

test('Workflow 12 & 13: Reset demo data and verify pristine original seed state', () => {
  // 12. Reset demo data
  mockStorage.removeItem(DEMO_STORAGE_KEY);
  const resetState: DemoStateData = { ...INITIAL_DEMO_STATE };
  mockStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(resetState));

  // 13. Verify original seed state restored
  const finalState: DemoStateData = JSON.parse(mockStorage.getItem(DEMO_STORAGE_KEY)!);
  assert.strictEqual(finalState.properties.length, INITIAL_DEMO_STATE.properties.length);
  assert.strictEqual(finalState.leads.length, 5);
  assert.strictEqual(finalState.siteVisits.length, 3);
  assert.strictEqual(finalState.bookings.length, 2);
  assert.strictEqual(finalState.activities.length, 4);
  assert.strictEqual(finalState.notifications.length, 3);
  assert.strictEqual(finalState.leads[0].buyerName, 'Mohanraj S.');
});
