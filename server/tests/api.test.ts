import { test, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { runSeed } from '../src/seeds/seed.js';
import { User } from '../src/models/User.js';
import { Lead } from '../src/models/Lead.js';
import { Property } from '../src/models/Property.js';
import { Booking } from '../src/models/Booking.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { Task } from '../src/models/Task.js';
import { SiteVisit } from '../src/models/SiteVisit.js';
import { MasterItem } from '../src/models/MasterItem.js';
import { WebContent } from '../src/models/WebContent.js';

let app: any;
let request: any;

let superAdminToken: string;
let superAdminUser: any;
let executive1Token: string;
let executive1User: any;
let executive2Token: string;
let executive2User: any;
let managerToken: string;
let listingManagerToken: string;
let buyerToken: string;

let testPropertyId: string;
let testLead1Id: string;
let testLead2Id: string;
let testBookingId: string;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/grounds_and_gates_test';

  // Connect to isolated test database
  const conn = await connectDatabase('mongodb://127.0.0.1:27017/grounds_and_gates_test');

  // Drop isolated test database to start 100% clean
  if (conn.connection.db) {
    await conn.connection.db.dropDatabase();
  }

  // Seed baseline roles, admin, properties, developers
  await runSeed(false);

  app = createApp();
  request = supertest(app);
});

after(async () => {
  try {
    if (mongoose.connection.db && mongoose.connection.name === 'grounds_and_gates_test') {
      await mongoose.connection.db.dropDatabase();
    }
  } catch {}
  await disconnectDatabase();
});

test('1. Health Check Endpoint', async () => {
  const res = await request.get('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'UP');
  assert.strictEqual(res.body.service, 'Grounds & Gates API');
});

test('2. Authentication: Super Admin Login & Staff User Provisioning', async () => {
  // Super Admin login
  const loginRes = await request.post('/api/v1/auth/login').send({
    email: 'admin@groundsandgates.com',
    password: 'Admin@Grounds2026',
  });

  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginRes.body.data.accessToken);
  assert.strictEqual(loginRes.body.data.user.role, 'super-admin');
  superAdminToken = loginRes.body.data.accessToken;
  superAdminUser = loginRes.body.data.user;

  // Super Admin provisions Executive 1
  const exec1Res = await request
    .post('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      fullName: 'Senthil Nathan (Exec 1)',
      email: 'exec1@groundsandgates.com',
      mobile: '9842211001',
      password: 'Executive@2026',
      role: 'sales-executive',
    });
  assert.strictEqual(exec1Res.status, 201);
  executive1User = exec1Res.body.data;

  // Executive 1 logs in
  const exec1Login = await request.post('/api/v1/auth/login').send({
    email: 'exec1@groundsandgates.com',
    password: 'Executive@2026',
  });
  assert.strictEqual(exec1Login.status, 200);
  executive1Token = exec1Login.body.data.accessToken;

  // Super Admin provisions Executive 2
  const exec2Res = await request
    .post('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      fullName: 'Priya Raman (Exec 2)',
      email: 'exec2@groundsandgates.com',
      mobile: '9842211002',
      password: 'Executive@2026',
      role: 'sales-executive',
    });
  assert.strictEqual(exec2Res.status, 201);
  executive2User = exec2Res.body.data;

  // Executive 2 logs in
  const exec2Login = await request.post('/api/v1/auth/login').send({
    email: 'exec2@groundsandgates.com',
    password: 'Executive@2026',
  });
  assert.strictEqual(exec2Login.status, 200);
  executive2Token = exec2Login.body.data.accessToken;

  // Super Admin provisions Sales Manager
  const mgrRes = await request
    .post('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      fullName: 'Anand Sundaram (Manager)',
      email: 'manager@groundsandgates.com',
      mobile: '9842211003',
      password: 'Manager@2026',
      role: 'sales-manager',
    });
  assert.strictEqual(mgrRes.status, 201);

  const mgrLogin = await request.post('/api/v1/auth/login').send({
    email: 'manager@groundsandgates.com',
    password: 'Manager@2026',
  });
  managerToken = mgrLogin.body.data.accessToken;

  // Super Admin provisions Listing Manager
  const lmRes = await request
    .post('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      fullName: 'Divya Krishnan (Listings)',
      email: 'listings@groundsandgates.com',
      mobile: '9842211004',
      password: 'Listings@2026',
      role: 'listing-manager',
    });
  assert.strictEqual(lmRes.status, 201);

  const lmLogin = await request.post('/api/v1/auth/login').send({
    email: 'listings@groundsandgates.com',
    password: 'Listings@2026',
  });
  listingManagerToken = lmLogin.body.data.accessToken;
});

test('3. Public Registration Privilege Escalation Protection', async () => {
  // Public registration attempting to claim 'super-admin' or 'admin' must be rejected
  const maliciousReg = await request.post('/api/v1/auth/register').send({
    fullName: 'Malicious Attacker',
    email: 'attacker@evil.com',
    mobile: '9842299999',
    password: 'HackerPassword1',
    role: 'super-admin',
  });
  assert.strictEqual(maliciousReg.status, 400);

  // Valid buyer registration succeeds
  const buyerEmail = `buyer_${Date.now()}@example.com`;
  const buyerReg = await request.post('/api/v1/auth/register').send({
    fullName: 'Genuine Buyer',
    email: buyerEmail,
    mobile: '9842277777',
    password: 'BuyerPassword1',
    role: 'buyer',
  });
  assert.strictEqual(buyerReg.status, 201);
  assert.strictEqual(buyerReg.body.data.user.role, 'buyer');
  buyerToken = buyerReg.body.data.accessToken;
});

test('4. Buyers & Sellers Denied Staff Admin API Access', async () => {
  // Buyer denied staff list
  const staffRes = await request
    .get('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${buyerToken}`);
  assert.strictEqual(staffRes.status, 403);

  // Buyer denied audit logs
  const auditRes = await request
    .get('/api/v1/audit-logs')
    .set('Authorization', `Bearer ${buyerToken}`);
  assert.strictEqual(auditRes.status, 403);

  // Buyer denied settings
  const settingsRes = await request
    .get('/api/v1/settings')
    .set('Authorization', `Bearer ${buyerToken}`);
  assert.strictEqual(settingsRes.status, 403);

  // Buyer denied CRM reports export
  const reportsRes = await request
    .get('/api/v1/reports/summary')
    .set('Authorization', `Bearer ${buyerToken}`);
  assert.strictEqual(reportsRes.status, 403);
});

test('5. Anonymous Requests Denied Protected API Access', async () => {
  const anon1 = await request.get('/api/v1/leads');
  assert.strictEqual(anon1.status, 401);

  const anon2 = await request.get('/api/v1/auth/staff');
  assert.strictEqual(anon2.status, 401);

  const anon3 = await request.get('/api/v1/reports/summary');
  assert.strictEqual(anon3.status, 401);
});

test('6. Sales Executive Record Ownership & Isolation', async () => {
  // Create Lead 1 assigned to Executive 1
  const lead1Res = await request
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      buyerName: 'Client Alpha',
      phone: '9842211111',
      email: 'alpha@client.com',
      propertyTitle: 'Race Course Luxury Apartment',
      assignedEmployeeId: executive1User._id,
      stage: 'new',
    });
  assert.strictEqual(lead1Res.status, 201);
  testLead1Id = lead1Res.body.data.referenceId;

  // Create Lead 2 assigned to Executive 2
  const lead2Res = await request
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      buyerName: 'Client Beta',
      phone: '9842222222',
      email: 'beta@client.com',
      propertyTitle: 'Avinashi Road Commercial Space',
      assignedEmployeeId: executive2User._id,
      stage: 'new',
    });
  assert.strictEqual(lead2Res.status, 201);
  testLead2Id = lead2Res.body.data.referenceId;

  // Executive 1 queries leads list -> should see Lead 1, but NOT Lead 2
  const exec1List = await request
    .get('/api/v1/leads')
    .set('Authorization', `Bearer ${executive1Token}`);
  assert.strictEqual(exec1List.status, 200);
  const exec1LeadIds = exec1List.body.data.map((l: any) => l.referenceId);
  assert.ok(exec1LeadIds.includes(testLead1Id));
  assert.ok(!exec1LeadIds.includes(testLead2Id));

  // Executive 1 attempts to directly access Lead 2 by ID -> Forbidden 403
  const accessDenied = await request
    .get(`/api/v1/leads/${testLead2Id}`)
    .set('Authorization', `Bearer ${executive1Token}`);
  assert.strictEqual(accessDenied.status, 403);

  // Executive 1 attempts to change stage of Lead 2 -> Forbidden 403
  const stageDenied = await request
    .patch(`/api/v1/leads/${testLead2Id}/stage`)
    .set('Authorization', `Bearer ${executive1Token}`)
    .send({ stage: 'negotiation' });
  assert.strictEqual(stageDenied.status, 403);

  // Executive 1 updates stage of own Lead 1 -> Succeeds 200
  const stageAllowed = await request
    .patch(`/api/v1/leads/${testLead1Id}/stage`)
    .set('Authorization', `Bearer ${executive1Token}`)
    .send({ stage: 'contacted' });
  assert.strictEqual(stageAllowed.status, 200);
  assert.strictEqual(stageAllowed.body.data.stage, 'contacted');
});

test('7. Lead Duplicate Detection and Merge', async () => {
  // Check duplicate with matching phone
  const dupCheck = await request
    .post('/api/v1/leads/check-duplicate')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ phone: '9842211111', email: 'different@mail.com' });
  assert.strictEqual(dupCheck.status, 200);
  assert.strictEqual(dupCheck.body.data.hasDuplicate, true);
  assert.ok(dupCheck.body.data.duplicates.length > 0);

  // Create a duplicate secondary lead
  const secLead = await request
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      buyerName: 'Client Alpha Duplicate',
      phone: '9842211111',
      email: 'alpha2@client.com',
      propertyTitle: 'Duplicate Inquiry',
      notes: 'Customer called back inquiring about price discount.',
      stage: 'new',
    });
  assert.strictEqual(secLead.status, 201);
  const secLeadId = secLead.body.data.referenceId;

  // Merge secondary lead into primary Lead 1
  const mergeRes = await request
    .post('/api/v1/leads/merge')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ primaryLeadId: testLead1Id, secondaryLeadId: secLeadId });
  assert.strictEqual(mergeRes.status, 200);

  // Secondary lead must no longer exist
  const deletedCheck = await Lead.findOne({ referenceId: secLeadId });
  assert.strictEqual(deletedCheck, null);

  // Primary lead must contain merged notes
  const updatedPrimary = await Lead.findOne({ referenceId: testLead1Id });
  assert.ok(updatedPrimary?.notes?.includes('Customer called back inquiring about price discount.'));
});

test('8. End-to-End CRM Flow: Lead -> Site Visit -> Booking -> Property State Sync', async () => {
  // 1. Fetch available property (supporting both live & sample in test environment)
  const propRes = await request.get('/api/v1/properties?limit=1&includeSample=true');
  assert.strictEqual(propRes.status, 200);
  assert.ok(propRes.body.data.length > 0);
  testPropertyId = propRes.body.data[0].referenceId;

  // 2. Schedule site visit
  const visitRes = await request
    .post('/api/v1/site-visits')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      propertyId: testPropertyId,
      propertyTitle: 'Verified Inspection Villa',
      customerName: 'Dr. Karunakaran',
      customerPhone: '9842233333',
      date: '2026-03-25',
      timeSlot: 'morning',
      leadId: testLead1Id,
    });
  assert.strictEqual(visitRes.status, 201);
  const visitId = visitRes.body.data.referenceId;

  // 3. Complete site visit
  const completeVisit = await request
    .patch(`/api/v1/site-visits/${visitId}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ status: 'completed', feedback: 'Buyer satisfied with DTCP documentation and layout.' });
  assert.strictEqual(completeVisit.status, 200);
  assert.strictEqual(completeVisit.body.data.status, 'completed');

  // 4. Create Booking
  const bookingRes = await request
    .post('/api/v1/bookings')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      propertyId: testPropertyId,
      propertyTitle: 'Verified Inspection Villa',
      customerId: 'cust-mohan-01',
      customerName: 'Dr. Karunakaran',
      leadId: testLead1Id,
      tokenAmount: 250000,
      totalAmount: 18000000,
      bookingDate: '2026-03-25',
      paymentMethod: 'Net Banking / RTGS',
    });
  assert.strictEqual(bookingRes.status, 201);
  testBookingId = bookingRes.body.data.bookingNumber;

  // 5. Verify Property status automatically synchronized to 'under-negotiation' & 'reserved'
  const propertyAfterBooking = await Property.findOne({ referenceId: testPropertyId });
  assert.strictEqual(propertyAfterBooking?.status, 'under-negotiation');
  assert.strictEqual(propertyAfterBooking?.availability, 'reserved');
});

test('9. Manual Payment Adjustment and Audit History', async () => {
  // Update booking payment status from 'pending' to 'confirmed'
  const updatePayment = await request
    .patch(`/api/v1/bookings/${testBookingId}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      paymentStatus: 'confirmed',
      notes: 'RTGS UTR Verified: SBIN0029381744. Funds credited to corporate escrow.',
    });
  assert.strictEqual(updatePayment.status, 200);
  assert.strictEqual(updatePayment.body.data.paymentStatus, 'confirmed');

  // Query Audit Log to verify actor and exact changes are preserved
  const auditRes = await request
    .get('/api/v1/audit-logs?module=BOOKINGS')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(auditRes.status, 200);
  const paymentAudit = auditRes.body.data.find((a: any) => a.action === 'PAYMENT_STATUS_ADJUSTED');
  assert.ok(paymentAudit);
  assert.strictEqual(paymentAudit.userEmail, 'admin@groundsandgates.com');
  assert.strictEqual(paymentAudit.changes.newPaymentStatus, 'confirmed');
});

test('10. Staff Deactivation, Session Revocation, and Workload Reassignment', async () => {
  // Executive 2 has an active token. Deactivate Executive 2
  const deactRes = await request
    .patch(`/api/v1/auth/staff/${executive2User._id}/status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ status: 'inactive' });
  assert.strictEqual(deactRes.status, 200);

  // Executive 2 attempts to use their existing token -> Revoked immediately 401/403
  const revokedRes = await request
    .get('/api/v1/leads')
    .set('Authorization', `Bearer ${executive2Token}`);
  assert.ok(revokedRes.status === 401 || revokedRes.status === 403);

  // Reassign Executive 2's records to Executive 1
  const reassignRes = await request
    .post('/api/v1/auth/staff/reassign')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      fromUserId: executive2User._id,
      toUserId: executive1User._id,
    });
  assert.strictEqual(reassignRes.status, 200);

  // Lead 2 must now be assigned to Executive 1
  const lead2 = await Lead.findOne({ referenceId: testLead2Id });
  assert.strictEqual(lead2?.assignedEmployeeId, executive1User._id);
});

test('11. Last Active Super Admin Protection', async () => {
  // Attempt to deactivate the only Super Admin -> Forbidden 403
  const deactAdmin = await request
    .patch(`/api/v1/auth/staff/${superAdminUser.id}/status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ status: 'inactive' });
  assert.strictEqual(deactAdmin.status, 403);
  assert.ok(deactAdmin.body.message.includes('Cannot deactivate the last active Super Administrator'));

  // Attempt to demote Super Admin to buyer -> Forbidden 403
  const demoteAdmin = await request
    .patch(`/api/v1/auth/staff/${superAdminUser.id}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ role: 'buyer' });
  assert.strictEqual(demoteAdmin.status, 403);
});

test('12. Property Publishing Status vs Availability & Legal Document Privacy', async () => {
  // Create a draft property with private legal documents
  const draftProp = await request
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      title: 'Secret Off-Market Plantation',
      category: 'agricultural-land',
      listingType: 'buy',
      ownershipType: 'company',
      price: 45000000,
      plotArea: 25,
      plotAreaUnit: 'acres',
      address: 'Kotagiri Road',
      district: 'Nilgiris',
      city: 'Kotagiri',
      locality: 'Kotagiri Foothills',
      pincode: '643217',
      state: 'Tamil Nadu',
      seller: {
        name: 'Heritage Land Trust',
        type: 'company',
        phone: '9842200000',
        email: 'estates@heritage.in',
      },
      published: false,
      publishingStatus: 'draft',
      availability: 'available',
      legalDocuments: [
        {
          title: 'Parent Title Deed 1982',
          url: '/api/v1/upload/documents/deed-1982.pdf',
          documentType: 'Title Deed',
          isPrivate: true,
        },
      ],
    });
  assert.strictEqual(draftProp.status, 201);
  const draftId = draftProp.body.data.referenceId;
  const draftSlug = draftProp.body.data.slug;

  // Anonymous public query: Draft property must NOT appear in public catalog
  const publicList = await request.get('/api/v1/properties?searchQuery=Plantation');
  assert.strictEqual(publicList.status, 200);
  const foundInPublic = publicList.body.data.some((p: any) => p.referenceId === draftId);
  assert.strictEqual(foundInPublic, false);

  // Anonymous public access to single draft property returns 404
  const publicSingle = await request.get(`/api/v1/properties/${draftSlug}`);
  assert.strictEqual(publicSingle.status, 404);

  // Super Admin publishes the property
  const publishRes = await request
    .patch(`/api/v1/properties/${draftId}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ published: true, publishingStatus: 'published' });
  assert.strictEqual(publishRes.status, 200);

  // Now public single property succeeds, but private legal documents MUST be stripped
  const publicNow = await request.get(`/api/v1/properties/${draftSlug}`);
  assert.strictEqual(publicNow.status, 200);
  assert.strictEqual(publicNow.body.data.title, 'Secret Off-Market Plantation');
  const docs = publicNow.body.data.legalDocuments || [];
  assert.strictEqual(docs.filter((d: any) => d.isPrivate).length, 0);

  // Listing Manager conducts verification review and awards badge
  const reviewRes = await request
    .post(`/api/v1/properties/${draftId}/review`)
    .set('Authorization', `Bearer ${listingManagerToken}`)
    .send({
      status: 'verified',
      notes: 'Chitta, Patta passbook, and encumbrance certificate verified clean for 30 years.',
    });
  assert.strictEqual(reviewRes.status, 200);
  assert.strictEqual(reviewRes.body.data.verified, true);
});

test('13. Password Reset Flow: Token Expiry, Single Use, and Safe Public Messaging', async () => {
  // Public forgot password request returns safe generic message (never leaks token or enumerates user)
  const forgotRes = await request.post('/api/v1/auth/forgot-password').send({
    email: 'admin@groundsandgates.com',
  });
  assert.strictEqual(forgotRes.status, 200);
  assert.ok(forgotRes.body.data.message);
  assert.strictEqual(forgotRes.body.data.resetToken, undefined); // Token must NEVER be exposed publicly

  // Retrieve hashed token from database
  const adminUserRecord = await User.findOne({ email: 'admin@groundsandgates.com' }).select('+resetPasswordToken');
  assert.ok(adminUserRecord?.resetPasswordToken);

  // Simulate token expiry
  adminUserRecord.resetPasswordExpires = new Date(Date.now() - 1000);
  await adminUserRecord.save();

  // Attempt reset with expired token fails
  const expiredRes = await request.post('/api/v1/auth/reset-password').send({
    token: 'any-token',
    newPassword: 'BrandNewPassword1',
  });
  assert.strictEqual(expiredRes.status, 400);

  // Re-generate fresh token
  const crypto = await import('node:crypto');
  const validRawToken = crypto.randomBytes(32).toString('hex');
  adminUserRecord.resetPasswordToken = crypto.createHash('sha256').update(validRawToken).digest('hex');
  adminUserRecord.resetPasswordExpires = new Date(Date.now() + 3600000);
  await adminUserRecord.save();

  // Reset password succeeds
  const resetSuccess = await request.post('/api/v1/auth/reset-password').send({
    token: validRawToken,
    newPassword: 'Admin@Grounds2026',
  });
  assert.strictEqual(resetSuccess.status, 200);

  // Attempting to reuse the same token a second time must fail (single-use enforced)
  const reuseAttempt = await request.post('/api/v1/auth/reset-password').send({
    token: validRawToken,
    newPassword: 'AnotherPassword2',
  });
  assert.strictEqual(reuseAttempt.status, 400);

  // Re-login Super Admin to obtain active token with updated tokenVersion
  const reLogin = await request.post('/api/v1/auth/login').send({
    email: 'admin@groundsandgates.com',
    password: 'Admin@Grounds2026',
  });
  assert.strictEqual(reLogin.status, 200);
  superAdminToken = reLogin.body.data.accessToken;
});

test('14. Media & Private Document Uploads: Separate Access Rules', async () => {
  // 1. Upload public image
  const imgRes = await request
    .post('/api/v1/upload/image')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .attach('file', Buffer.from('fake image content'), {
      filename: 'sample_photo.jpg',
      contentType: 'image/jpeg',
    });
  assert.strictEqual(imgRes.status, 201);
  assert.ok(imgRes.body.data.url.startsWith('/uploads/images/'));

  // 2. Upload private legal document
  const docRes = await request
    .post('/api/v1/upload/document')
    .set('Authorization', `Bearer ${listingManagerToken}`)
    .attach('file', Buffer.from('%PDF-1.4 sample pdf content'), {
      filename: 'patta_certificate.pdf',
      contentType: 'application/pdf',
    });
  assert.strictEqual(docRes.status, 201);
  assert.strictEqual(docRes.body.data.isPrivate, true);
  const docFilename = docRes.body.data.filename;

  // 3. Anonymous access to private document is denied (401)
  const anonDoc = await request.get(`/api/v1/upload/documents/${docFilename}`);
  assert.strictEqual(anonDoc.status, 401);

  // 4. Staff access to private document succeeds (200)
  const staffDoc = await request
    .get(`/api/v1/upload/documents/${docFilename}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(staffDoc.status, 200);
});

test('15. Reports & CSV Export with Formula Injection Protection', async () => {
  // Sales Executive denied reports export (403)
  const execDenied = await request
    .get('/api/v1/reports/export?type=leads')
    .set('Authorization', `Bearer ${executive1Token}`);
  assert.strictEqual(execDenied.status, 403);

  // Super Admin creates a lead containing malicious formula injection attempt
  await request
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      buyerName: '=CMD|"/C calc"!A0',
      phone: '+91 9999999999',
      email: 'calc@hack.com',
      propertyTitle: 'Formula Test Property',
      stage: 'new',
    });

  // Super Admin exports leads CSV
  const csvRes = await request
    .get('/api/v1/reports/export?type=leads')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(csvRes.status, 200);
  assert.ok(csvRes.headers['content-type'].includes('text/csv'));

  // Verify formula cell was sanitized by prepending single quote
  assert.ok(csvRes.text.includes("'=CMD"));
});

test('16. Append-Only Audit Log Querying & Filtering', async () => {
  const auditRes = await request
    .get('/api/v1/audit-logs?module=TEAM')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(auditRes.status, 200);
  assert.ok(Array.isArray(auditRes.body.data));
  assert.ok(auditRes.body.data.length > 0);
  assert.ok(auditRes.body.data.every((a: any) => a.module === 'TEAM'));
});

test('17. Reversible Sample Data Provenance & Live API Exclusion', async () => {
  // Query live properties endpoint without includeSample flag
  const liveRes = await request.get('/api/v1/properties');
  assert.strictEqual(liveRes.status, 200);
  // All returned records must NOT be sample fixtures
  assert.ok(liveRes.body.data.every((p: any) => p.isSample !== true));

  // Query provenance audit endpoint
  const provRes = await request
    .get('/api/v1/analytics/provenance')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(provRes.status, 200);
  assert.ok(provRes.body.data.properties.sample >= 32);
  assert.strictEqual(provRes.body.data.properties.ambiguous, 0);
});

test('18. Masters: Public Safe Lookups & Batch Endpoint', async () => {
  // Batch lookup for categories and districts
  const batchRes = await request
    .get('/api/v1/masters/public/batch?types=property_category,district,amenity');
  assert.strictEqual(batchRes.status, 200);
  assert.ok(batchRes.body.data);
  assert.ok(Array.isArray(batchRes.body.data.property_category));
  assert.ok(Array.isArray(batchRes.body.data.district));
  assert.ok(batchRes.body.data.property_category.length > 0);
  assert.ok(batchRes.body.data.district.length > 0);

  // Single public lookup for districts
  const distRes = await request.get('/api/v1/masters/public?type=district');
  assert.strictEqual(distRes.status, 200);
  assert.ok(Array.isArray(distRes.body.data));
  const cbe = distRes.body.data.find((d: any) => d.code === 'coimbatore');
  assert.ok(cbe);
  assert.strictEqual(cbe.name, 'Coimbatore');
  assert.strictEqual(cbe.nameTa, 'கோயம்புத்தூர்');
});

test('19. Masters: Create Locality with Parent District & Dependent Filtering', async () => {
  // Create a new custom locality under Coimbatore
  const newLocRes = await request
    .post('/api/v1/masters/locality')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      code: 'test-neelambur',
      name: 'Neelambur Bypass',
      nameTa: 'நீலம்பூர் பைபாஸ்',
      parentCode: 'coimbatore',
      displayOrder: 99,
      metadata: { pinCode: '641062', zone: 'East Coimbatore' }
    });
  assert.strictEqual(newLocRes.status, 201);
  assert.strictEqual(newLocRes.body.data.code, 'test-neelambur');
  assert.strictEqual(newLocRes.body.data.parentCode, 'coimbatore');

  // Verify dependent child filtering by parentCode
  const filteredRes = await request
    .get('/api/v1/masters?type=locality&parentCode=coimbatore')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(filteredRes.status, 200);
  const found = filteredRes.body.data.items.find((l: any) => l.code === 'test-neelambur');
  assert.ok(found);
  assert.strictEqual(found.metadata.pinCode, '641062');

  // Verify it does NOT appear when querying under Chennai
  const chennaiRes = await request
    .get('/api/v1/masters?type=locality&parentCode=chennai')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(chennaiRes.status, 200);
  const notFound = chennaiRes.body.data.items.find((l: any) => l.code === 'test-neelambur');
  assert.strictEqual(notFound, undefined);
});

test('20. Masters: Create & Update Amenity with Bilingual Fields', async () => {
  // Create an amenity
  const amenityRes = await request
    .post('/api/v1/masters/amenity')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      code: 'ev-charging-station',
      name: 'EV Fast Charging Station',
      nameTa: 'மின்னூட்டு நிலையம்',
      description: 'Dedicated 50kW fast charger for electric vehicles.',
      displayOrder: 25,
      metadata: { icon: 'EvStationIcon' }
    });
  assert.strictEqual(amenityRes.status, 201);
  const amenityId = amenityRes.body.data._id;

  // Update its description and Tamil name
  const updateRes = await request
    .put(`/api/v1/masters/amenity/${amenityId}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      name: 'Ultra EV Fast Charging Station',
      nameTa: 'அதிவேக மின்னூட்டு நிலையம்',
      description: 'Updated dedicated 60kW fast charger.',
    });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.body.data.name, 'Ultra EV Fast Charging Station');
  assert.strictEqual(updateRes.body.data.nameTa, 'அதிவேக மின்னூட்டு நிலையம்');
});

test('21. Masters: Deactivate Lead Source and Verify Exclusion from Public APIs', async () => {
  // Find whatsapp lead source
  const findRes = await request
    .get('/api/v1/masters?type=lead_source&search=whatsapp')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(findRes.status, 200);
  assert.ok(findRes.body.data.items.length > 0);
  const sourceItem = findRes.body.data.items[0];

  // Toggle status to Inactive (PATCH /api/v1/masters/:type/:id/status)
  const toggleRes = await request
    .patch(`/api/v1/masters/lead_source/${sourceItem._id}/status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ isActive: false });
  assert.strictEqual(toggleRes.status, 200);
  assert.strictEqual(toggleRes.body.data.isActive, false);

  // Verify public endpoint excludes this inactive master
  const pubRes = await request.get('/api/v1/masters/public?type=lead_source');
  assert.strictEqual(pubRes.status, 200);
  const existsInPublic = pubRes.body.data.some((s: any) => s.code === sourceItem.code);
  assert.strictEqual(existsInPublic, false);

  // Re-activate it for subsequent test safety
  await request
    .patch(`/api/v1/masters/lead_source/${sourceItem._id}/status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ isActive: true });
});

test('22. Masters: Hard Delete Blocked on Referenced Master with Usage Counts', async () => {
  // 1. Create a custom non-system parent district
  const customDistRes = await request
    .post('/api/v1/masters/district')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      code: 'custom-delta-region',
      name: 'Custom Delta Region',
      nameTa: 'டெல்டா மண்டலம்',
      displayOrder: 80,
      isSystem: false,
    });
  assert.strictEqual(customDistRes.status, 201);
  const customDist = customDistRes.body.data;

  // 2. Create a child locality referencing this parent code
  const childLocRes = await request
    .post('/api/v1/masters/locality')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      code: 'kumbakonam-town',
      name: 'Kumbakonam Town',
      nameTa: 'கும்பகோணம்',
      parentCode: customDist.code,
      displayOrder: 1,
      isSystem: false,
    });
  assert.strictEqual(childLocRes.status, 201);

  // 3. Query usage endpoint directly
  const usageRes = await request
    .get(`/api/v1/masters/district/${customDist._id}/usage`)
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(usageRes.status, 200);
  assert.strictEqual(usageRes.body.data.totalUsage, 1);
  assert.strictEqual(usageRes.body.data.references.childMasters, 1);

  // 4. Attempt hard delete on this actively referenced parent master
  const delRes = await request
    .delete(`/api/v1/masters/district/${customDist._id}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
  // Must return 409 Conflict with detailed error message
  assert.strictEqual(delRes.status, 409);
  assert.ok(delRes.body.message.includes('Cannot delete'));
  assert.ok(delRes.body.message.includes('actively referenced in 1 records'));
});

test('23. Masters: System Master Protected from Deletion & Code Mutation', async () => {
  // System master item (e.g. sale transaction type)
  const txRes = await request
    .get('/api/v1/masters?type=transaction_type&search=buy')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(txRes.status, 200);
  const buyTx = txRes.body.data.items.find((t: any) => t.code === 'buy');
  assert.ok(buyTx);
  assert.strictEqual(buyTx.isSystem, true);

  // Attempting to delete a system master must return 400 Bad Request
  const delSysRes = await request
    .delete(`/api/v1/masters/transaction_type/${buyTx._id}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(delSysRes.status, 400);
  assert.ok(delSysRes.body.message.includes('cannot be deleted'));

  // Attempting to mutate stable code of a system master must fail
  const renameRes = await request
    .put(`/api/v1/masters/transaction_type/${buyTx._id}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ code: 'mutated-buy-code' });
  assert.strictEqual(renameRes.status, 400);
  assert.ok(renameRes.body.message.includes('Cannot alter the stable system code'));
});

test('24. WebContent: Draft vs. Published Separation', async () => {
  // Get public version of homepage_hero
  const initialPubRes = await request.get('/api/v1/content/public/homepage_hero');
  assert.strictEqual(initialPubRes.status, 200);
  const originalTitle = initialPubRes.body.data.title;

  // Save a draft update as Super Admin
  const draftRes = await request
    .put('/api/v1/content/homepage_hero')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      title: 'Unpublished Draft Title - Architects of Trust',
      titleTa: 'வெளியிடப்படாத வரைவு தலைப்பு',
      subtitle: 'Exclusive draft subtext that is not live yet.',
      content: { headlineBadge: 'Draft Exclusive 2026' }
    });
  assert.strictEqual(draftRes.status, 200);
  assert.strictEqual(draftRes.body.data.status, 'draft');
  assert.strictEqual(draftRes.body.data.draftContent.title, 'Unpublished Draft Title - Architects of Trust');

  // Verify public endpoint still serves the ORIGINAL published content
  const cachedPubRes = await request.get('/api/v1/content/public/homepage_hero');
  assert.strictEqual(cachedPubRes.status, 200);
  assert.strictEqual(cachedPubRes.body.data.title, originalTitle);
  assert.notStrictEqual(cachedPubRes.body.data.title, 'Unpublished Draft Title - Architects of Trust');
});

test('25. WebContent: Publish to Live & Discard Draft Workflows', async () => {
  // Publish the draft created in previous test
  const pubRes = await request
    .post('/api/v1/content/homepage_hero/publish')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(pubRes.status, 200);
  assert.strictEqual(pubRes.body.data.status, 'published');
  assert.strictEqual(pubRes.body.data.title, 'Unpublished Draft Title - Architects of Trust');

  // Verify public endpoint NOW returns the updated published content
  const liveRes = await request.get('/api/v1/content/public/homepage_hero');
  assert.strictEqual(liveRes.status, 200);
  assert.strictEqual(liveRes.body.data.title, 'Unpublished Draft Title - Architects of Trust');

  // Test Discard Draft Workflow: create another draft then discard it
  await request
    .put('/api/v1/content/homepage_hero')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ title: 'Temporary Mistake Title' });

  const discardRes = await request
    .post('/api/v1/content/homepage_hero/discard')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(discardRes.status, 200);
  assert.strictEqual(discardRes.body.data.status, 'published');
  assert.strictEqual(discardRes.body.data.draftContent, null);
});

test('26. Masters: Reconciliation Dry-Run Migration Report', async () => {
  const reportRes = await request
    .get('/api/v1/masters/migration/report')
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(reportRes.status, 200);
  assert.strictEqual(reportRes.body.data.isDryRun, true);
  assert.ok(reportRes.body.data.totalMastersSeeded > 0);
  assert.ok(reportRes.body.data.totalContentSectionsSeeded > 0);
  assert.ok(reportRes.body.data.propertiesReconciled.total >= 0);
});

test('27. Masters & Content RBAC: Anonymous & Unauthorized Access Denied', async () => {
  // Anonymous GET protected endpoint -> 401
  const anonRes = await request.get('/api/v1/masters');
  assert.strictEqual(anonRes.status, 401);

  // Sales Executive cannot delete a master -> 403
  const execDelRes = await request
    .delete('/api/v1/masters/property_category/dummy-id')
    .set('Authorization', `Bearer ${executive1Token}`);
  assert.strictEqual(execDelRes.status, 403);

  // Sales Executive cannot publish web content -> 403
  const execPubRes = await request
    .post('/api/v1/content/homepage_hero/publish')
    .set('Authorization', `Bearer ${executive1Token}`);
  assert.strictEqual(execPubRes.status, 403);
});

test('28. Geospatial Search: Center + Radius, Straight-Line Distance, and Sorting', async () => {
  // Search near Coimbatore center (11.0168, 76.9558) within 15 km
  const res = await request.get('/api/v1/properties?nearLat=11.0168&nearLng=76.9558&radius=15&includeSample=true&sortBy=distance');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);

  // Verify distance calculations are attached and labelled
  const first = res.body.data[0];
  assert.ok(typeof first.distanceKm === 'number');
  assert.ok(first.distanceLabel.includes('Straight-line distance'));

  // Verify distance sorting: item 0 <= item 1
  if (res.body.data.length > 1) {
    assert.ok(res.body.data[0].distanceKm <= res.body.data[1].distanceKm);
  }
});

test('29. Geospatial Viewport Search & Lightweight Map Markers Endpoint', async () => {
  // Query lightweight map markers within Tamil Nadu bounds
  const markersRes = await request.get('/api/v1/properties/map-markers?includeSample=true');
  assert.strictEqual(markersRes.status, 200);
  assert.ok(Array.isArray(markersRes.body.data));
  assert.ok(markersRes.body.data.length > 0);

  const marker = markersRes.body.data[0];
  assert.ok(marker.id);
  assert.ok(marker.title);
  assert.ok(typeof marker.lat === 'number');
  assert.ok(typeof marker.lng === 'number');
  assert.ok(typeof marker.price === 'number');

  // Test bbox filtering around Coimbatore [minLng, minLat, maxLng, maxLat]
  const bboxRes = await request.get('/api/v1/properties/map-markers?bbox=76.8,10.9,77.2,11.2&includeSample=true');
  assert.strictEqual(bboxRes.status, 200);
  assert.ok(Array.isArray(bboxRes.body.data));
});

test('30. Location Missing vs Confirmed CRM Inventory Filter', async () => {
  const confirmedRes = await request.get('/api/v1/properties?locationStatus=confirmed&includeSample=true');
  assert.strictEqual(confirmedRes.status, 200);
  assert.ok(Array.isArray(confirmedRes.body.data));

  const missingRes = await request.get('/api/v1/properties?locationStatus=missing&includeSample=true');
  assert.strictEqual(missingRes.status, 200);
  assert.ok(Array.isArray(missingRes.body.data));
});

test('31. Geoapify Service Status & Graceful Provider Handling', async () => {
  const statusRes = await request.get('/api/v1/geo/status');
  assert.strictEqual(statusRes.status, 200);
  assert.strictEqual(statusRes.body.success, true);
  assert.ok('configured' in statusRes.body);

  // Invalid coordinates rejected with 400
  const invalidGeoRes = await request.get('/api/v1/geo/reverse?lat=invalid&lng=invalid');
  assert.strictEqual(invalidGeoRes.status, 400);
});

test('32. Location Save, Reload, and GeoJSON Point Synchronization', async () => {
  // Create a new property with explicit GPS coordinates
  const createRes = await request
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      title: 'Automated GPS Verification Villa',
      description: 'Clear title test property with verified pin coordinates.',
      category: 'villas',
      listingType: 'buy',
      ownershipType: 'company',
      price: 5500000,
      priceUnit: 'Total',
      location: 'Saravanampatti',
      locality: 'Saravanampatti',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641035',
      address: 'KGISL IT Park Road, Saravanampatti',
      coordinates: {
        lat: 11.0764,
        lng: 77.0045,
      },
      locationConfirmed: true,
      locationSource: 'picker',
      isApproximateLocation: false,
      plotArea: 5,
      plotAreaUnit: 'cents',
      status: 'active',
      published: true,
    });

  assert.strictEqual(createRes.status, 201);
  const createdId = createRes.body.data._id || createRes.body.data.id;
  assert.ok(createdId);
  assert.strictEqual(createRes.body.data.locationConfirmed, true);
  assert.strictEqual(createRes.body.data.coordinates?.lat, 11.0764);
  assert.strictEqual(createRes.body.data.coordinates?.lng, 77.0045);
  // Verify GeoJSON [longitude, latitude] order
  assert.strictEqual(createRes.body.data.locationGeo?.coordinates?.[0], 77.0045);
  assert.strictEqual(createRes.body.data.locationGeo?.coordinates?.[1], 11.0764);

  // Reload the property from database
  const reloadRes = await request
    .get(`/api/v1/properties/${createdId}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(reloadRes.status, 200);
  assert.strictEqual(reloadRes.body.data.locationConfirmed, true);
  assert.strictEqual(reloadRes.body.data.coordinates?.lat, 11.0764);
  assert.strictEqual(reloadRes.body.data.coordinates?.lng, 77.0045);

  // Update coordinates via PATCH
  const patchRes = await request
    .patch(`/api/v1/properties/${createdId}`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({
      coordinates: {
        lat: 11.0800,
        lng: 77.0100,
      },
      locationConfirmed: true,
    });
  assert.strictEqual(patchRes.status, 200);
  assert.strictEqual(patchRes.body.data.coordinates?.lat, 11.08);
  assert.strictEqual(patchRes.body.data.coordinates?.lng, 77.01);
  assert.strictEqual(patchRes.body.data.locationGeo?.coordinates?.[0], 77.01);
  assert.strictEqual(patchRes.body.data.locationGeo?.coordinates?.[1], 11.08);

  // Clean up
  await request
    .delete(`/api/v1/properties/${createdId}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
});

test('33. Nearby Facilities (Places) & Autocomplete Provider Live Calls', async () => {
  const statusRes = await request.get('/api/v1/geo/status');
  assert.strictEqual(statusRes.status, 200);

  if (statusRes.body.configured) {
    // Autocomplete test
    const autoRes = await request.get('/api/v1/geo/autocomplete?text=Saravanampatti');
    assert.strictEqual(autoRes.status, 200);
    assert.ok(Array.isArray(autoRes.body.data));

    // Nearby facilities test near Coimbatore
    const placesRes = await request.get('/api/v1/geo/places?lat=11.0168&lng=76.9558&category=schools&radius=3000');
    assert.strictEqual(placesRes.status, 200);
    assert.ok(Array.isArray(placesRes.body.data));
  }
});

test('34. Category-Aware Property Creation, Seller Whitelisting, Draft Persistence & Document Upload', async () => {
  // 1. Register a genuine seller
  const sellerEmail = `seller_${Date.now()}@testgrounds.com`;
  const sellerReg = await request.post('/api/v1/auth/register').send({
    fullName: 'Senthil Nathan Seller',
    email: sellerEmail,
    mobile: '9842212345',
    password: 'SellerPass123!',
    role: 'seller',
  });
  assert.strictEqual(sellerReg.status, 201);
  const sellerToken = sellerReg.body.data.accessToken;

  // 2. Seller saves an initial draft listing with incomplete data
  const draftCreateRes = await request
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({
      title: 'Kovaipudur Hillside Villa Plot',
      category: 'residential-plots',
      listingType: 'buy',
      isDraft: true,
      draftStep: 2,
      locality: 'Kovaipudur',
      district: 'Coimbatore',
      // Attacker attempts privilege escalation:
      verified: true,
      ownershipType: 'company',
      isSample: true,
      featured: true,
    });
  assert.strictEqual(draftCreateRes.status, 201);
  const draftProp = draftCreateRes.body.data;
  assert.strictEqual(draftProp.publishingStatus, 'draft');
  assert.strictEqual(draftProp.verified, false, 'Seller must not be able to self-verify listing');
  assert.strictEqual(draftProp.ownershipType, 'third-party', 'Seller listing must not be labeled as company-owned');
  assert.strictEqual(draftProp.isSample, false);
  assert.strictEqual(draftProp.featured, false);

  // 3. Seller resumes draft from /drafts/mine
  const resumeRes = await request
    .get('/api/v1/properties/drafts/mine')
    .set('Authorization', `Bearer ${sellerToken}`);
  assert.strictEqual(resumeRes.status, 200);
  assert.strictEqual(resumeRes.body.data.referenceId, draftProp.referenceId);
  assert.strictEqual(resumeRes.body.data.draftStep, 2);

  // 4. Seller uploads a private legal document for verification
  const fakeDocBuffer = Buffer.from('%PDF-1.4 sample verification deed content');
  const docUploadRes = await request
    .post('/api/v1/upload/document')
    .set('Authorization', `Bearer ${sellerToken}`)
    .attach('file', fakeDocBuffer, 'kovaipudur_patta.pdf');
  assert.strictEqual(docUploadRes.status, 201);
  assert.strictEqual(docUploadRes.body.data.isPrivate, true);
  assert.ok(docUploadRes.body.data.url.includes('/api/v1/upload/documents/'));

  // 5. Seller updates draft with category-specific plot specifications & legal doc reference
  const updateRes = await request
    .patch(`/api/v1/properties/${draftProp.referenceId}`)
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({
      price: 4500000,
      plotArea: 5,
      plotAreaUnit: 'cents',
      plotLength: 60,
      plotWidth: 36.3,
      roadWidthFeet: 30,
      roadType: 'tar',
      isCornerPlot: true,
      isGatedLayout: true,
      boundaryWall: true,
      legalDocuments: [
        {
          title: 'Patta & Title Deed',
          url: docUploadRes.body.data.url,
          documentType: 'Patta',
          isPrivate: true,
        },
      ],
      draftStep: 6,
      isDraft: true,
    });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.body.data.plotLength, 60);
  assert.strictEqual(updateRes.body.data.isCornerPlot, true);
  assert.strictEqual(updateRes.body.data.roadType, 'tar');

  // 6. Submit property for review (finalize draft)
  const submitRes = await request
    .patch(`/api/v1/properties/${draftProp.referenceId}`)
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({
      isDraft: false,
      publishingStatus: 'pending-review',
    });
  assert.strictEqual(submitRes.status, 200);
  assert.strictEqual(submitRes.body.data.publishingStatus, 'pending-review');
  assert.strictEqual(submitRes.body.data.published, false);

  // 7. Ownership protection: Another seller cannot tamper with this listing
  const anotherSellerReg = await request.post('/api/v1/auth/register').send({
    fullName: 'Intruder Seller',
    email: `intruder_${Date.now()}@testgrounds.com`,
    mobile: '9842299881',
    password: 'IntruderPass123!',
    role: 'seller',
  });
  const intruderToken = anotherSellerReg.body.data.accessToken;

  const intruderTamperRes = await request
    .patch(`/api/v1/properties/${draftProp.referenceId}`)
    .set('Authorization', `Bearer ${intruderToken}`)
    .send({ price: 1000 });
  assert.strictEqual(intruderTamperRes.status, 403);
  assert.ok(intruderTamperRes.body.message.includes('only modify your own'));

  // 8. Public detail access is blocked while listing is pending review
  const publicUnpublishedRes = await request.get(`/api/v1/properties/${draftProp.slug}`);
  assert.strictEqual(publicUnpublishedRes.status, 404);
  assert.strictEqual(publicUnpublishedRes.body.message, 'Property listing is not currently published.');

  // 9. Seller can preview their own unpublished listing via authenticated seller endpoint (by slug and referenceId)
  const ownerPreviewSlugRes = await request
    .get(`/api/v1/properties/seller/${draftProp.slug}`)
    .set('Authorization', `Bearer ${sellerToken}`);
  assert.strictEqual(ownerPreviewSlugRes.status, 200);
  assert.strictEqual(ownerPreviewSlugRes.body.data.referenceId, draftProp.referenceId);

  const ownerPreviewRefRes = await request
    .get(`/api/v1/properties/seller/${draftProp.referenceId}`)
    .set('Authorization', `Bearer ${sellerToken}`);
  assert.strictEqual(ownerPreviewRefRes.status, 200);

  // 10. Another seller is rejected with 403 when trying to preview this private listing
  const intruderPreviewRes = await request
    .get(`/api/v1/properties/seller/${draftProp.slug}`)
    .set('Authorization', `Bearer ${intruderToken}`);
  assert.strictEqual(intruderPreviewRes.status, 403);

  // 11. Authorized admin can review unpublished listing with complete documents
  const adminReviewRes = await request
    .get(`/api/v1/properties/admin/review/${draftProp.slug}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
  assert.strictEqual(adminReviewRes.status, 200);
  assert.strictEqual(adminReviewRes.body.data.referenceId, draftProp.referenceId);

  // 12. Admin approves and publishes the listing
  const publishRes = await request
    .patch(`/api/v1/properties/${draftProp.referenceId}/publish-status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ publishingStatus: 'published' });
  assert.strictEqual(publishRes.status, 200);
  assert.strictEqual(publishRes.body.data.publishingStatus, 'published');
  assert.strictEqual(publishRes.body.data.published, true);

  // 13. Public detail URL now returns 200
  const publicPublishedRes = await request.get(`/api/v1/properties/${draftProp.slug}`);
  assert.strictEqual(publicPublishedRes.status, 200);
  assert.strictEqual(publicPublishedRes.body.data.title, 'Kovaipudur Hillside Villa Plot');

  // 14. Admin unpublishes the listing (moves to draft)
  const unpublishRes = await request
    .patch(`/api/v1/properties/${draftProp.referenceId}/publish-status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ publishingStatus: 'draft' });
  assert.strictEqual(unpublishRes.status, 200);
  assert.strictEqual(unpublishRes.body.data.publishingStatus, 'draft');
  assert.strictEqual(unpublishRes.body.data.published, false);

  // 15. Public access is immediately revoked
  const publicRevokedRes = await request.get(`/api/v1/properties/${draftProp.slug}`);
  assert.strictEqual(publicRevokedRes.status, 404);
  assert.strictEqual(publicRevokedRes.body.message, 'Property listing is not currently published.');

  // Clean up
  await request
    .delete(`/api/v1/properties/${draftProp.referenceId}`)
    .set('Authorization', `Bearer ${superAdminToken}`);
});

test('35. Firebase Authentication: Identity Mapping, Idempotent Onboarding, Email Verification & Session Revocation', async () => {
  const makeTestFbToken = (uid: string, email: string, emailVerified = true) =>
    `test_token_${uid}_${Buffer.from(email.toLowerCase()).toString('base64')}_${emailVerified ? '1' : '0'}`;

  // 1. Rejection of unauthenticated request to onboarding
  const unauthOnboarding = await request.post('/api/v1/auth/onboarding').send({
    fullName: 'Test User',
    mobile: '9842271000',
  });
  assert.strictEqual(unauthOnboarding.status, 401);

  // 2. Public registration onboarding with Firebase token
  const testUid = `fb_client_${Date.now()}`;
  const testEmail = `fb_buyer_${Date.now()}@groundsandgates.com`;
  const fbTokenUnverified = makeTestFbToken(testUid, testEmail, false);

  // Privilege escalation guard: trying to register as super-admin in onboarding must be rejected with 403
  const privEscRes = await request
    .post('/api/v1/auth/onboarding')
    .set('Authorization', `Bearer ${fbTokenUnverified}`)
    .send({
      fullName: 'Hacker User',
      mobile: '9842271000',
      role: 'super-admin',
      termsAccepted: true,
    });
  assert.strictEqual(privEscRes.status, 403);

  // Valid buyer onboarding
  const onboardRes = await request
    .post('/api/v1/auth/onboarding')
    .set('Authorization', `Bearer ${fbTokenUnverified}`)
    .send({
      fullName: 'Kavitha Rajan',
      mobile: '9842271000',
      accountUsage: 'buyer',
      role: 'buyer',
      address: { district: 'Coimbatore', city: 'R.S. Puram' },
      termsAccepted: true,
      marketingConsent: true,
    });
  assert.strictEqual(onboardRes.status, 201);
  assert.strictEqual(onboardRes.body.data.user.fullName, 'Kavitha Rajan');
  assert.strictEqual(onboardRes.body.data.user.email, testEmail);
  assert.strictEqual(onboardRes.body.data.user.firebaseUid, testUid);
  assert.strictEqual(onboardRes.body.data.user.emailVerified, false);

  // 3. Idempotent onboarding retry does not create duplicates
  const retryOnboard = await request
    .post('/api/v1/auth/onboarding')
    .set('Authorization', `Bearer ${fbTokenUnverified}`)
    .send({
      fullName: 'Kavitha Rajan Updated',
      mobile: '9842271000',
      accountUsage: 'buyer',
      termsAccepted: true,
    });
  assert.strictEqual(retryOnboard.status, 200);
  assert.strictEqual(retryOnboard.body.data.user.fullName, 'Kavitha Rajan Updated');

  // Verify only 1 record exists in MongoDB
  const count = await User.countDocuments({ firebaseUid: testUid });
  assert.strictEqual(count, 1);

  // 4. Authenticated profile endpoint resolves correctly with Firebase token
  const profileRes = await request
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${fbTokenUnverified}`);
  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileRes.body.data.email, testEmail);

  // 5. Verification sync: unverified remains false
  const syncUnverified = await request
    .post('/api/v1/auth/sync-verification')
    .set('Authorization', `Bearer ${fbTokenUnverified}`);
  assert.strictEqual(syncUnverified.status, 200);
  assert.strictEqual(syncUnverified.body.data.emailVerified, false);

  // 6. Verification sync: token with verified email updates MongoDB profile
  const fbTokenVerified = makeTestFbToken(testUid, testEmail, true);
  const syncVerified = await request
    .post('/api/v1/auth/sync-verification')
    .set('Authorization', `Bearer ${fbTokenVerified}`);
  assert.strictEqual(syncVerified.status, 200);
  assert.strictEqual(syncVerified.body.data.emailVerified, true);

  const updatedUserRecord = await User.findOne({ firebaseUid: testUid });
  assert.strictEqual(updatedUserRecord?.emailVerified, true);

  // 7. Role permissions: Buyer with verified Firebase token cannot access Admin team endpoint
  const adminDenied = await request
    .get('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${fbTokenVerified}`);
  assert.strictEqual(adminDenied.status, 403);

  // 8. Super Admin authentication with Firebase token
  const superAdminUid = `fb_superadmin_${Date.now()}`;
  const superAdminFbToken = makeTestFbToken(superAdminUid, 'admin@groundsandgates.com', true);

  // Linking legacy Super Admin by verified email
  const superAdminProfile = await request
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${superAdminFbToken}`);
  assert.strictEqual(superAdminProfile.status, 200);
  assert.strictEqual(superAdminProfile.body.data.role, 'super-admin');

  // Super Admin can access staff endpoint using Firebase token
  const staffList = await request
    .get('/api/v1/auth/staff')
    .set('Authorization', `Bearer ${superAdminFbToken}`);
  assert.strictEqual(staffList.status, 200);
  assert.ok(Array.isArray(staffList.body.data));

  // 9. Legacy User Migration dry-run status
  const migrationRes = await request
    .get('/api/v1/auth/migration/status')
    .set('Authorization', `Bearer ${superAdminFbToken}`);
  assert.strictEqual(migrationRes.status, 200);
  assert.ok(migrationRes.body.data.totalUsers > 0);
  assert.ok(migrationRes.body.data.superAdminsCount >= 1);
  assert.strictEqual(migrationRes.body.data.passwordHashAlgorithm.includes('bcrypt'), true);
  assert.strictEqual(migrationRes.body.data.supportedFirebaseImportFormat.includes('BCRYPT'), true);

  // Clean up test user
  await User.deleteOne({ firebaseUid: testUid });
});
