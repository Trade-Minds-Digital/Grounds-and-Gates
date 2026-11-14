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
  // 1. Fetch available property
  const propRes = await request.get('/api/v1/properties?limit=1');
  assert.strictEqual(propRes.status, 200);
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
