# Grounds & Gates — Authentication & Security Architecture

## 1. Overview

Grounds & Gates implements a full-stack, enterprise-grade authentication system utilizing:
- **bcryptjs**: Salted password hashing (10 salt rounds).
- **jsonwebtoken (JWT)**: Cryptographically signed tokens with separate Access and Refresh lifecycles.
- **HTTP-Only Cookies & Bearer Headers**: Dual transport support ensuring maximum compatibility with web applications, mobile wrappers, and automated API clients.
- **Strict Role-Based Access Control (RBAC)**: Fine-grained authorization guards applied at the route level.

---

## 2. Token Lifecycle

- **Access Token**:
  - Expiration: `15 minutes` (configurable via `JWT_EXPIRES_IN`).
  - Stored in: `Authorization: Bearer <token>` header or `accessToken` cookie.
  - Payload: `{ userId, email, role }`.
- **Refresh Token**:
  - Expiration: `7 days` (configurable via `JWT_REFRESH_EXPIRES_IN`).
  - Stored in: HTTP-Only cookie `refreshToken` or sent via `/auth/refresh`.
  - Used to issue fresh access tokens without requiring re-authentication.

---

## 3. Seeded Accounts for Testing & Review

| Role | Email | Password | Primary Accessible Views |
|---|---|---|---|
| **Super Admin** | `admin@groundsandgates.com` | `Admin@Grounds2026` / `Admin@123` | Full CRM, Analytics, User Management, Listings, Bookings |
| **Seller / Owner** | `seller@groundsandgates.com` | `Seller@123` | Seller Dashboard, Property Listings, Inbound Leads |
| **Real Estate Agent**| `agent@groundsandgates.com` | `Agent@123` | Agent CRM, Site Visits, Client Management |
| **Verified Buyer** | `buyer@groundsandgates.com` | `Buyer@123` | Buyer Dashboard, Favorites, Scheduled Visits, Enquiries |

---

## 4. Role-Based Access Control (RBAC) Matrix

| Module / Action | super-admin | admin | sales-manager | sales-executive | agent | seller | buyer | public |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Public Property Browse & Search** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Property Details & Master Plan** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Submit Enquiry / Schedule Visit** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Favorites & Comparisons** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Post / Create Property** | Yes | Yes | Yes | No | Yes | Yes | No | No |
| **Edit Any Property** | Yes | Yes | Yes | No | No | No | No | No |
| **Update Listing Status** | Yes | Yes | Yes | No | No | No | No | No |
| **View Full CRM Pipeline** | Yes | Yes | Yes | Assigned Only | Assigned | No | No | No |
| **Assign Leads to Staff** | Yes | Yes | Yes | No | No | No | No | No |
| **Transition Lead Stage** | Yes | Yes | Yes | Yes | Yes | No | No | No |
| **Schedule / Manage Visits** | Yes | Yes | Yes | Yes | Yes | Own | Own | No |
| **Create Booking & Token Receipt** | Yes | Yes | Yes | Yes | No | No | No | No |
| **Admin Analytics Aggregations** | Yes | Yes | Yes | No | No | No | No | No |
| **Manage Developers & Projects** | Yes | Yes | Yes | No | No | No | No | No |

---

## 5. Security Middleware Guards

- `authenticate`: Extracts Bearer token or cookie, verifies signature, confirms active user status in database, attaches `req.user`.
- `optionalAuthenticate`: Attaches `req.user` if valid token is supplied, otherwise allows request to proceed unauthenticated.
- `requireRole(...allowedRoles)`: Rejects with HTTP 403 Forbidden if `req.user.role` is not in the permitted list.
- `requirePermission(permission)`: Checks dynamic permissions against user's assigned role.
