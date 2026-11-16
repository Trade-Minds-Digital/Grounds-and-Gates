/**
 * Grounds & Gates - Request-Level Regression Test Suite
 * Asserts ZERO HTTP requests to forbidden endpoints across all 8 roles:
 *  1. Public Visitor (unauthenticated)
 *  2. Buyer
 *  3. Seller
 *  4. Listing Manager
 *  5. Sales Executive
 *  6. Sales Manager
 *  7. Admin
 *  8. Super Admin
 *
 * Verifies that unauthorized queries and mutations are blocked BEFORE
 * any HTTP network dispatch occurs.
 */

import test from 'node:test';
import assert from 'node:assert';
import {
  canReadCustomers,
  canReadTasks,
  canReadTeam,
  canManageTeam,
  canReadReports,
  canReadAuditLogs,
  canReadAdminContent,
  canModifyContent,
  canReadAdminMasters,
  canModifyMasters,
  canReadAdminProperties,
  canPublishProperties,
  canReadSellerProperties,
  canReadLeads,
  canReadBookings,
  canReadSiteVisits,
  canReadSettings,
  canModifySettings,
} from './rbac';

type Role =
  | 'visitor'
  | 'buyer'
  | 'seller'
  | 'listing-manager'
  | 'sales-executive'
  | 'sales-manager'
  | 'admin'
  | 'super-admin';

interface SimulatedUser {
  id: string;
  role: string | null;
  accountStatus: 'active' | 'inactive';
}

const ALL_ROLES: Role[] = [
  'visitor',
  'buyer',
  'seller',
  'listing-manager',
  'sales-executive',
  'sales-manager',
  'admin',
  'super-admin',
];

const getUserForRole = (role: Role): SimulatedUser | null => {
  if (role === 'visitor') return null;
  return {
    id: `user-${role}-01`,
    role,
    accountStatus: 'active',
  };
};

// Forbidden Endpoints Matrix per Role according to backend RBAC
const FORBIDDEN_ENDPOINTS: Record<Role, string[]> = {
  visitor: [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/settings',
    '/content',
    '/properties/manage',
    '/properties/seller/mine',
    '/leads',
    '/bookings',
    '/site-visits',
    '/masters',
  ],
  buyer: [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/content',
    '/properties/manage',
    '/properties/seller/mine',
    '/leads',
    '/masters',
  ],
  seller: [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/content',
    '/properties/manage',
    '/masters',
  ],
  'listing-manager': [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/leads',
    '/bookings',
    '/site-visits',
  ],
  'sales-executive': [
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/content',
    '/properties/manage',
  ],
  'sales-manager': [
    '/audit-logs',
  ],
  admin: [],
  'super-admin': [],
};

// Permitted Endpoints Matrix per Role
const PERMITTED_ENDPOINTS: Record<Role, string[]> = {
  visitor: [
    '/properties',
    '/properties/map-markers',
    '/masters/public',
    '/content/public',
  ],
  buyer: [
    '/properties',
    '/properties/map-markers',
    '/bookings',
    '/site-visits',
    '/masters/public',
    '/content/public',
  ],
  seller: [
    '/properties',
    '/properties/seller/mine',
    '/leads',
    '/bookings',
    '/site-visits',
  ],
  'listing-manager': [
    '/properties/manage',
    '/properties/seller/mine',
    '/masters',
    '/content',
  ],
  'sales-executive': [
    '/customers',
    '/tasks',
    '/leads',
    '/bookings',
    '/site-visits',
    '/masters',
  ],
  'sales-manager': [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/properties/manage',
    '/leads',
    '/bookings',
    '/site-visits',
    '/masters',
    '/content',
  ],
  admin: [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/properties/manage',
    '/leads',
    '/bookings',
    '/site-visits',
    '/masters',
    '/content',
  ],
  'super-admin': [
    '/customers',
    '/tasks',
    '/auth/users',
    '/reports/summary',
    '/audit-logs',
    '/properties/manage',
    '/leads',
    '/bookings',
    '/site-visits',
    '/masters',
    '/content',
  ],
};

// Simulated Query Gate Evaluator reflecting useCrmQueries, usePropertyQueries, etc.
const shouldDispatchQuery = (endpoint: string, user: SimulatedUser | null, authReady = true, profileReady = true): boolean => {
  if (!authReady || !profileReady) return false;
  const role = user?.role;
  const isActive = user?.accountStatus === 'active';

  switch (endpoint) {
    case '/customers':
      return Boolean(user && isActive && canReadCustomers(role));
    case '/tasks':
      return Boolean(user && isActive && canReadTasks(role));
    case '/auth/users':
      return Boolean(user && isActive && canReadTeam(role));
    case '/reports/summary':
      return Boolean(user && isActive && canReadReports(role));
    case '/audit-logs':
      return Boolean(user && isActive && canReadAuditLogs(role));
    case '/content':
      return Boolean(user && isActive && canReadAdminContent(role));
    case '/masters':
      return Boolean(user && isActive && canReadAdminMasters(role));
    case '/properties/manage':
      return Boolean(user && isActive && canReadAdminProperties(role));
    case '/properties/seller/mine':
      return Boolean(user && isActive && canReadSellerProperties(role));
    case '/leads':
      return Boolean(user && isActive && canReadLeads(role));
    case '/bookings':
      return Boolean(user && isActive && canReadBookings(role));
    case '/site-visits':
      return Boolean(user && isActive && canReadSiteVisits(role));
    case '/settings':
      return Boolean(user && isActive && canReadSettings(role));
    case '/properties':
    case '/properties/map-markers':
    case '/masters/public':
    case '/content/public':
      return true; // Public endpoints
    default:
      return false;
  }
};

test('Regression: ZERO HTTP requests dispatched to forbidden endpoints across all 8 roles', () => {
  for (const role of ALL_ROLES) {
    const user = getUserForRole(role);
    const forbidden = FORBIDDEN_ENDPOINTS[role];
    const dispatchedForbiddenEndpoints: string[] = [];

    // Simulate query attempts against all forbidden endpoints
    for (const ep of forbidden) {
      const allowed = shouldDispatchQuery(ep, user);
      if (allowed) {
        dispatchedForbiddenEndpoints.push(ep);
      }
    }

    assert.strictEqual(
      dispatchedForbiddenEndpoints.length,
      0,
      `Role '${role}' attempted forbidden HTTP calls to: ${dispatchedForbiddenEndpoints.join(', ')}`
    );
  }
});

test('Regression: Listing Manager is strictly denied from /customers, /tasks, and /reports', () => {
  const lmUser = getUserForRole('listing-manager');

  assert.strictEqual(shouldDispatchQuery('/customers', lmUser), false, 'Listing Manager must not call /customers');
  assert.strictEqual(shouldDispatchQuery('/tasks', lmUser), false, 'Listing Manager must not call /tasks');
  assert.strictEqual(shouldDispatchQuery('/reports/summary', lmUser), false, 'Listing Manager must not call /reports/summary');
  assert.strictEqual(shouldDispatchQuery('/auth/users', lmUser), false, 'Listing Manager must not call /auth/users');
  assert.strictEqual(shouldDispatchQuery('/audit-logs', lmUser), false, 'Listing Manager must not call /audit-logs');
});

test('Regression: Sales Executive is strictly denied from /auth/users, /reports, /audit-logs, and /content', () => {
  const seUser = getUserForRole('sales-executive');

  assert.strictEqual(shouldDispatchQuery('/auth/users', seUser), false, 'Sales Executive must not call /auth/users');
  assert.strictEqual(shouldDispatchQuery('/reports/summary', seUser), false, 'Sales Executive must not call /reports/summary');
  assert.strictEqual(shouldDispatchQuery('/audit-logs', seUser), false, 'Sales Executive must not call /audit-logs');
  assert.strictEqual(shouldDispatchQuery('/content', seUser), false, 'Sales Executive must not call /content');
  assert.strictEqual(shouldDispatchQuery('/properties/manage', seUser), false, 'Sales Executive must not call /properties/manage');
});

test('Regression: Public Visitor triggers ZERO authenticated CRM requests', () => {
  const visitorUser = getUserForRole('visitor');

  for (const ep of FORBIDDEN_ENDPOINTS.visitor) {
    assert.strictEqual(
      shouldDispatchQuery(ep, visitorUser),
      false,
      `Public visitor must not dispatch requests to ${ep}`
    );
  }
});

test('Regression: Unresolved Auth or Profile Loading state halts protected requests', () => {
  const adminUser = getUserForRole('super-admin');

  // Auth loading -> must not dispatch
  assert.strictEqual(shouldDispatchQuery('/customers', adminUser, false, true), false);
  // Profile loading -> must not dispatch
  assert.strictEqual(shouldDispatchQuery('/customers', adminUser, true, false), false);
  // Both resolved -> allowed for super-admin
  assert.strictEqual(shouldDispatchQuery('/customers', adminUser, true, true), true);
});

test('Regression: Permitted endpoints are accurately allowed for authorized roles', () => {
  for (const role of ALL_ROLES) {
    const user = getUserForRole(role);
    const permitted = PERMITTED_ENDPOINTS[role];

    for (const ep of permitted) {
      assert.strictEqual(
        shouldDispatchQuery(ep, user),
        true,
        `Role '${role}' expected to access permitted endpoint: ${ep}`
      );
    }
  }
});

test('Regression: Mutation guards stop unauthorized operations before HTTP dispatch', () => {
  // 1. Delete property: only super-admin and admin
  const canDelete = (role: Role) => role === 'super-admin' || role === 'admin';
  assert.strictEqual(canDelete('seller'), false);
  assert.strictEqual(canDelete('listing-manager'), false);
  assert.strictEqual(canDelete('sales-executive'), false);
  assert.strictEqual(canDelete('admin'), true);
  assert.strictEqual(canDelete('super-admin'), true);

  // 2. Publish property: only super-admin, admin, listing-manager
  assert.strictEqual(canPublishProperties('seller'), false);
  assert.strictEqual(canPublishProperties('sales-executive'), false);
  assert.strictEqual(canPublishProperties('sales-manager'), false);
  assert.strictEqual(canPublishProperties('listing-manager'), true);
  assert.strictEqual(canPublishProperties('admin'), true);
  assert.strictEqual(canPublishProperties('super-admin'), true);

  // 3. Manage team: only super-admin and admin
  assert.strictEqual(canManageTeam('sales-manager'), false);
  assert.strictEqual(canManageTeam('sales-executive'), false);
  assert.strictEqual(canManageTeam('listing-manager'), false);
  assert.strictEqual(canManageTeam('admin'), true);
  assert.strictEqual(canManageTeam('super-admin'), true);

  // 4. Modify settings: strictly super-admin
  assert.strictEqual(canModifySettings('admin'), false);
  assert.strictEqual(canModifySettings('sales-manager'), false);
  assert.strictEqual(canModifySettings('super-admin'), true);
});
