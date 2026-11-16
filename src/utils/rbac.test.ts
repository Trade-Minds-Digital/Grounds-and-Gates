import test from 'node:test';
import assert from 'node:assert';
import {
  isStaffRole,
  isSellerRole,
  isBuyerRole,
  canViewModule,
  canPerformAction,
  canAccessResource,
  STAFF_ROLES,
} from './rbac';

test('isStaffRole accurately identifies staff vs non-staff roles', () => {
  // Staff roles
  assert.strictEqual(isStaffRole('super-admin'), true);
  assert.strictEqual(isStaffRole('admin'), true);
  assert.strictEqual(isStaffRole('sales-manager'), true);
  assert.strictEqual(isStaffRole('sales-executive'), true);
  assert.strictEqual(isStaffRole('listing-manager'), true);

  // Non-staff roles
  assert.strictEqual(isStaffRole('seller'), false);
  assert.strictEqual(isStaffRole('buyer'), false);
  assert.strictEqual(isStaffRole('agent'), false);
  assert.strictEqual(isStaffRole('developer'), false);
  assert.strictEqual(isStaffRole(undefined), false);
  assert.strictEqual(isStaffRole(null), false);
});

test('canViewModule denies sellers and buyers from all staff CRM modules', () => {
  const staffOnlyModules = ['customers', 'team', 'tasks', 'reports', 'audit-log', 'settings', 'masters', 'content'] as const;

  for (const mod of staffOnlyModules) {
    assert.strictEqual(canViewModule('seller', mod), false, `Seller must not view ${mod}`);
    assert.strictEqual(canViewModule('buyer', mod), false, `Buyer must not view ${mod}`);
  }

  // Super-admin has access to all modules
  for (const mod of staffOnlyModules) {
    assert.strictEqual(canViewModule('super-admin', mod), true, `Super-admin must view ${mod}`);
  }
});

test('canViewModule enforces granular staff role boundaries', () => {
  // Sales Executive can view leads, customers, site-visits, bookings, tasks
  assert.strictEqual(canViewModule('sales-executive', 'leads'), true);
  assert.strictEqual(canViewModule('sales-executive', 'customers'), true);
  assert.strictEqual(canViewModule('sales-executive', 'team'), false, 'Sales executive must not view team management');
  assert.strictEqual(canViewModule('sales-executive', 'settings'), false, 'Sales executive must not view settings');
  assert.strictEqual(canViewModule('sales-executive', 'audit-log'), false, 'Sales executive must not view audit logs');

  // Listing Manager can view properties, projects, masters
  assert.strictEqual(canViewModule('listing-manager', 'properties'), true);
  assert.strictEqual(canViewModule('listing-manager', 'masters'), true);
  assert.strictEqual(canViewModule('listing-manager', 'customers'), false, 'Listing manager must not view customers');
  assert.strictEqual(canViewModule('listing-manager', 'team'), false, 'Listing manager must not view team');
});

test('canPerformAction blocks unauthorized mutations prior to execution', () => {
  // Delete action is restricted to super-admin and admin
  assert.strictEqual(canPerformAction('seller', 'properties', 'delete'), false);
  assert.strictEqual(canPerformAction('sales-executive', 'leads', 'delete'), false);
  assert.strictEqual(canPerformAction('admin', 'leads', 'delete'), true);
  assert.strictEqual(canPerformAction('super-admin', 'leads', 'delete'), true);

  // Publish action is restricted to super-admin, admin, listing-manager
  assert.strictEqual(canPerformAction('seller', 'properties', 'publish'), false);
  assert.strictEqual(canPerformAction('sales-executive', 'properties', 'publish'), false);
  assert.strictEqual(canPerformAction('listing-manager', 'properties', 'publish'), true);

  // Assign action requires manager or admin
  assert.strictEqual(canPerformAction('seller', 'leads', 'assign'), false);
  assert.strictEqual(canPerformAction('sales-executive', 'leads', 'assign'), false);
  assert.strictEqual(canPerformAction('sales-manager', 'leads', 'assign'), true);
});

test('canAccessResource strictly checks record ownership for sellers and buyers', () => {
  // Staff can access
  assert.strictEqual(canAccessResource('super-admin', 'customer'), true);
  assert.strictEqual(canAccessResource('admin', 'task'), true);

  // Seller cannot access staff-only customer/team/task resources
  assert.strictEqual(canAccessResource('seller', 'customer'), false);
  assert.strictEqual(canAccessResource('seller', 'team'), false);
  assert.strictEqual(canAccessResource('seller', 'task'), false);

  // Seller can only access their own properties
  assert.strictEqual(
    canAccessResource('seller', 'property', { ownerId: 'user-seller-01', currentUserId: 'user-seller-01' }),
    true
  );
  assert.strictEqual(
    canAccessResource('seller', 'property', { ownerId: 'user-seller-99', currentUserId: 'user-seller-01' }),
    false
  );

  // Buyer can only access their own bookings/visits
  assert.strictEqual(
    canAccessResource('buyer', 'booking', { ownerId: 'user-buyer-01', currentUserId: 'user-buyer-01' }),
    true
  );
  assert.strictEqual(
    canAccessResource('buyer', 'booking', { ownerId: 'user-buyer-99', currentUserId: 'user-buyer-01' }),
    false
  );
});

test('Query eligibility gating conditions accurately isolate role scopes', () => {
  const evaluateCustomerEligibility = (user: { role?: string; accountStatus?: string } | null, authReady: boolean, profileReady: boolean) => {
    const isEligible = authReady && profileReady && user?.accountStatus === 'active' && isStaffRole(user?.role);
    return Boolean(isEligible);
  };

  const evaluateSellerPropertiesEligibility = (user: { role?: string; accountStatus?: string } | null, authReady: boolean, profileReady: boolean) => {
    const isEligible = authReady && profileReady && user?.accountStatus === 'active' && (user?.role === 'seller' || isStaffRole(user?.role));
    return Boolean(isEligible);
  };

  // 1. Unauthenticated visitor -> 0 CRM requests
  assert.strictEqual(evaluateCustomerEligibility(null, true, true), false);
  assert.strictEqual(evaluateSellerPropertiesEligibility(null, true, true), false);

  // 2. Auth loading -> not ready
  assert.strictEqual(evaluateCustomerEligibility({ role: 'admin', accountStatus: 'active' }, false, false), false);

  // 3. Seller -> customer is BLOCKED, seller properties is ALLOWED
  const sellerUser = { role: 'seller', accountStatus: 'active' };
  assert.strictEqual(evaluateCustomerEligibility(sellerUser, true, true), false, 'Seller MUST NOT be eligible for customers query');
  assert.strictEqual(evaluateSellerPropertiesEligibility(sellerUser, true, true), true, 'Seller MUST be eligible for seller properties');

  // 4. Buyer -> customer and seller properties are BOTH BLOCKED
  const buyerUser = { role: 'buyer', accountStatus: 'active' };
  assert.strictEqual(evaluateCustomerEligibility(buyerUser, true, true), false);
  assert.strictEqual(evaluateSellerPropertiesEligibility(buyerUser, true, true), false);

  // 5. Staff Admin -> customer is ALLOWED
  const adminUser = { role: 'admin', accountStatus: 'active' };
  assert.strictEqual(evaluateCustomerEligibility(adminUser, true, true), true);
});
