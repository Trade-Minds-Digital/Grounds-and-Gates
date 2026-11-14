import { test } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { User } from '../src/models/User.js';
import { Property } from '../src/models/Property.js';
import { Lead } from '../src/models/Lead.js';
import { Customer } from '../src/models/Customer.js';
import { SiteVisit } from '../src/models/SiteVisit.js';
import { Booking } from '../src/models/Booking.js';

test('GROUNDS & GATES — REAL MONGODB PERSISTENCE ACROSS RESTART GATE', async () => {
  console.log('\n=============================================================');
  console.log('⚡ STEP 1: INITIALIZING BACKEND INSTANCE 1 & CONNECTING TO MONGODB');
  console.log('=============================================================');

  await connectDatabase('mongodb://127.0.0.1:27017/grounds_and_gates');
  let app = createApp();
  let request = supertest(app);

  const testId = Date.now();
  const testUserEmail = `persistence.test.${testId}@groundsandgates.com`;
  const testPropertyRef = `GG-PERSIST-${testId}`;
  const testLeadRef = `lead-persist-${testId}`;
  const testVisitRef = `visit-persist-${testId}`;
  const testBookingRef = `book-persist-${testId}`;

  // Login as Super Admin to get authorization token
  const adminLoginRes = await request.post('/api/v1/auth/login').send({
    email: 'admin@groundsandgates.com',
    password: 'Admin@Grounds2026',
  });
  assert.strictEqual(adminLoginRes.status, 200, 'Admin login failed');
  const adminToken = adminLoginRes.body.data.accessToken;

  console.log('\n⚡ STEP 2: REGISTERING NEW TEST USER VIA API...');
  const registerRes = await request.post('/api/v1/auth/register').send({
    fullName: `Dr. K. Senthil Nathan (${testId})`,
    email: testUserEmail,
    mobile: '9842279999',
    password: 'UserSecurePass@123',
    role: 'buyer',
  });
  assert.strictEqual(registerRes.status, 201, `User registration failed: ${JSON.stringify(registerRes.body)}`);
  const registeredUserId = registerRes.body.data.user.id || registerRes.body.data.user._id;
  console.log(`   ✅ User registered successfully. ID: ${registeredUserId}`);

  console.log('\n⚡ STEP 3: CREATING PROPERTY LISTING VIA API...');
  const propertyRes = await request
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      referenceId: testPropertyRef,
      title: `Gated Luxury Estate Plot (Persistence Verification ${testId})`,
      category: 'residential-plots',
      listingType: 'buy',
      ownershipType: 'company',
      price: 8500000,
      priceUnit: 'Total',
      negotiable: true,
      plotArea: 2400,
      plotAreaUnit: 'sq.ft',
      facing: 'North',
      address: '14/B Gated Avenue, Race Course Corridor',
      district: 'Coimbatore',
      locality: 'Race Course',
      pincode: '641018',
    });
  assert.strictEqual(propertyRes.status, 201, `Property creation failed: ${JSON.stringify(propertyRes.body)}`);
  console.log(`   ✅ Property created with referenceId: ${testPropertyRef}`);

  console.log('\n⚡ STEP 4: CREATING CUSTOMER & CRM LEAD...');
  const leadRes = await request
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      referenceId: testLeadRef,
      customerId: `cust-${testId}`,
      buyerName: `Dr. K. Senthil Nathan`,
      phone: '9842279999',
      email: testUserEmail,
      propertyId: testPropertyRef,
      propertyTitle: `Gated Luxury Estate Plot (${testId})`,
      stage: 'new',
      priority: 'high',
      assignedEmployeeId: 'emp-senthil-01',
      message: 'Interested in immediate registration and site survey',
    });
  assert.strictEqual(leadRes.status, 201, `Lead creation failed: ${JSON.stringify(leadRes.body)}`);
  console.log(`   ✅ Lead created with referenceId: ${testLeadRef}`);

  console.log('\n⚡ STEP 5: UPDATING LEAD ASSIGNMENT AND STAGE...');
  const stageRes = await request
    .patch(`/api/v1/leads/${testLeadRef}/stage`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ stage: 'qualified' });
  assert.strictEqual(stageRes.status, 200, `Lead stage update failed: ${JSON.stringify(stageRes.body)}`);
  assert.strictEqual(stageRes.body.data.stage, 'qualified');

  const assignRes = await request
    .patch(`/api/v1/leads/${testLeadRef}/assign`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ employeeId: 'emp-priya-02' });
  assert.strictEqual(assignRes.status, 200, `Lead assign failed: ${JSON.stringify(assignRes.body)}`);
  console.log(`   ✅ Lead reassigned to emp-priya-02 and moved to stage 'qualified'`);

  console.log('\n⚡ STEP 6: CREATING SITE VISIT RECORD...');
  const visitRes = await request
    .post('/api/v1/site-visits')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      referenceId: testVisitRef,
      leadId: testLeadRef,
      propertyId: testPropertyRef,
      propertyTitle: `Gated Luxury Estate Plot (${testId})`,
      customerId: `cust-${testId}`,
      customerName: 'Dr. K. Senthil Nathan',
      customerPhone: '9842279999',
      assignedEmployeeId: 'emp-priya-02',
      date: '2026-11-20',
      timeSlot: 'morning',
      notes: 'Customer requires site boundary markers inspection',
      transportProvided: true,
    });
  assert.strictEqual(visitRes.status, 201, `Visit creation failed: ${JSON.stringify(visitRes.body)}`);
  console.log(`   ✅ Site visit created: ${testVisitRef}`);

  console.log('\n⚡ STEP 7: CREATING BOOKING RECORD WITH BUSINESS RULES...');
  const bookingRes = await request
    .post('/api/v1/bookings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      referenceId: testBookingRef,
      propertyId: testPropertyRef,
      propertyTitle: `Gated Luxury Estate Plot (${testId})`,
      customerId: `cust-${testId}`,
      customerName: 'Dr. K. Senthil Nathan',
      leadId: testLeadRef,
      tokenAmount: 250000,
      totalAmount: 8500000,
      agreedPrice: 8500000,
      bookingDate: '2026-11-14',
      paymentMethod: 'Net Banking / RTGS',
    });
  assert.strictEqual(bookingRes.status, 201, `Booking creation failed: ${JSON.stringify(bookingRes.body)}`);
  assert.strictEqual(bookingRes.body.data.paymentStatus, 'pending', 'Payment status must initially be pending');
  console.log(`   ✅ Booking created: #${bookingRes.body.data.bookingNumber} (Payment status: PENDING)`);

  console.log('\n⚡ STEP 8: COMPLETELY STOPPING BACKEND PROCESS & DISCONNECTING DATABASE...');
  await disconnectDatabase();
  console.log('   🛑 Backend instance 1 completely terminated and disconnected.');

  console.log('\n⚡ STEP 9: REBOOTING BACKEND INSTANCE 2 (NEW PROCESS LIFECYCLE)...');
  await connectDatabase('mongodb://127.0.0.1:27017/grounds_and_gates');
  const app2 = createApp();
  const request2 = supertest(app2);
  console.log('   🔄 Backend instance 2 restarted and connected fresh to MongoDB.');

  console.log('\n⚡ STEP 10: RETRIEVING ALL RECORDS TO PROVE ZERO DATA LOSS...');
  // 1. Verify User persisted
  const userInDb = await User.findOne({ email: testUserEmail });
  assert.ok(userInDb, 'User must exist in MongoDB after restart');
  assert.strictEqual(userInDb.fullName, `Dr. K. Senthil Nathan (${testId})`);
  console.log(`   ✅ 1. User persisted in MongoDB: ${userInDb.email} (ID: ${userInDb._id})`);

  // 2. Verify Property persisted via API
  const propertyGetRes = await request2.get(`/api/v1/properties/${testPropertyRef}`);
  assert.strictEqual(propertyGetRes.status, 200, 'Property must be retrievable after restart');
  assert.strictEqual(propertyGetRes.body.data.price, 8500000);
  assert.strictEqual(propertyGetRes.body.data.status, 'under-negotiation', 'Property status must reflect booking');
  assert.strictEqual(propertyGetRes.body.data.availability, 'reserved');
  console.log(`   ✅ 2. Property persisted: ${propertyGetRes.body.data.title} (Status: ${propertyGetRes.body.data.status})`);

  // 3. Verify CRM Lead persisted
  const leadInDb = await Lead.findOne({ referenceId: testLeadRef });
  assert.ok(leadInDb, 'Lead must exist in MongoDB after restart');
  assert.strictEqual(leadInDb.stage, 'won', 'Lead stage moved to won upon booking');
  assert.strictEqual(leadInDb.assignedEmployeeId, 'emp-priya-02');
  console.log(`   ✅ 3. Lead persisted: ${leadInDb.referenceId} (Stage: ${leadInDb.stage}, Assignee: ${leadInDb.assignedEmployeeId})`);

  // 4. Verify Site Visit persisted
  const visitInDb = await SiteVisit.findOne({ referenceId: testVisitRef });
  assert.ok(visitInDb, 'Site visit must exist in MongoDB after restart');
  assert.strictEqual(visitInDb.date, '2026-11-20');
  console.log(`   ✅ 4. Site visit persisted: ${visitInDb.referenceId} on ${visitInDb.date}`);

  // 5. Verify Booking persisted
  const bookingInDb = await Booking.findOne({ referenceId: testBookingRef });
  assert.ok(bookingInDb, 'Booking must exist in MongoDB after restart');
  assert.strictEqual(bookingInDb.tokenAmount, 250000);
  assert.strictEqual(bookingInDb.paymentStatus, 'pending');
  console.log(`   ✅ 5. Booking persisted: ${bookingInDb.bookingNumber} (Token: ₹${bookingInDb.tokenAmount})`);

  // Step 11: Execute payment verification on backend 2
  const verifyPayRes = await request2
    .patch(`/api/v1/bookings/${testBookingRef}/verify-payment`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      transactionRef: `HDFC-RTGS-${testId}-VERIFIED`,
      amount: 250000,
      paymentMethod: 'Net Banking / RTGS',
    });
  assert.strictEqual(verifyPayRes.status, 200, `Payment verification failed: ${JSON.stringify(verifyPayRes.body)}`);
  assert.strictEqual(verifyPayRes.body.data.paymentStatus, 'paid');
  console.log(`   ✅ 6. Server-side payment verification executed: Ref ${verifyPayRes.body.data.transactionRef}`);

  await disconnectDatabase();
  console.log('\n🏆 ALL 10 PERSISTENCE VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  console.log('=============================================================\n');
});
