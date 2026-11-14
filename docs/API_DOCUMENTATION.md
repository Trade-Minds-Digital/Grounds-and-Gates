# Grounds & Gates — Production REST API Documentation

Base URL: `http://localhost:5000/api/v1` (Fallback prefix `/api` also supported)

---

## 1. Authentication & RBAC (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user (Buyer, Owner, Agent) |
| `POST` | `/auth/login` | Public | Login with email & password, returns JWT token |
| `POST` | `/auth/refresh` | Public | Refresh expired access token via refresh token |
| `GET` | `/auth/me` | Authenticated | Get current authenticated user profile |
| `POST` | `/auth/logout` | Authenticated | Clears cookies and revokes session |

### Sample Login Request
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@groundsandgates.com",
  "password": "Admin@Grounds2026"
}
```

### Sample Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6735...",
      "fullName": "Super Administrator",
      "email": "admin@groundsandgates.com",
      "role": "super-admin"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

---

## 2. Properties (`/api/v1/properties`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/properties` | Public | Query properties with filtering, search, and pagination |
| `GET` | `/properties/:idOrSlug` | Public | Retrieve property details by ID or URL slug |
| `POST` | `/properties` | Agent / Admin / Owner | Create a new property listing |
| `PUT / PATCH` | `/properties/:id` | Creator / Admin | Update existing property listing |
| `PATCH` | `/properties/:id/status`| Admin / Manager | Update listing status (`active`, `under-negotiation`, `sold`) |
| `DELETE` | `/properties/:id` | Creator / Admin | Delete or archive property listing |

### Query Parameters for `GET /properties`
- `category`: `residential-plots`, `agricultural-land`, `independent-houses`, `villas`, `apartments`, `commercial-properties`
- `district`: Coimbatore, Chennai, Madurai, Tiruppur, Erode, Salem, Trichy, Pollachi, Ooty, Hosur
- `locality`: Specific area within district
- `ownershipType`: `company` or `third-party`
- `minPrice` / `maxPrice`: Price range in INR
- `bedrooms`: `1`, `2`, `3`, `4`, `5+`
- `facing`: `North`, `South`, `East`, `West`, etc.
- `featuredOnly`: `true` or `false`
- `searchQuery`: Full-text search term
- `sortBy`: `price-asc`, `price-desc`, `date-desc`, `popular`
- `page`: Page index (default: 1)
- `limit`: Items per page (default: 20)

---

## 3. Projects & Developers (`/api/v1/projects`, `/api/v1/developers`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects` | Public | List all premium gated communities and townships |
| `GET` | `/projects/:idOrSlug` | Public | Get project details, master plan, and child units |
| `POST` | `/projects` | Admin / Builder | Create project |
| `GET` | `/developers` | Public | List verified developers and builders |
| `GET` | `/developers/:id` | Public | Get developer profile and track record |

---

## 4. CRM & Leads Management (`/api/v1/leads`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/leads` | Staff / Admin | List CRM leads with stage, priority, and agent filters |
| `GET` | `/leads/:id` | Staff / Admin | Get lead details and activity timeline |
| `POST` | `/leads` | Authenticated | Create lead manually |
| `PATCH` | `/leads/:id/stage` | Staff / Admin | Transition lead stage (`new`, `contacted`, `qualified`, `scheduled`, `negotiation`, `won`, `lost`) |
| `PATCH` | `/leads/:id/assign`| Manager / Admin | Reassign lead to employee |
| `POST` | `/leads/:id/activities` | Staff / Admin | Log call notes, messages, or meetings |

---

## 5. Public Enquiries (`/api/v1/enquiries`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/enquiries` | Public | Submit enquiry from property page (auto-creates Lead & Site Visit) |
| `GET` | `/enquiries/my-enquiries` | Authenticated Buyer | Get current user's submitted enquiries |
| `GET` | `/enquiries/seller-leads` | Authenticated Seller | Get enquiries for seller's properties |

---

## 6. Site Visits (`/api/v1/site-visits`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/site-visits` | Authenticated | List scheduled, completed, and upcoming site visits |
| `POST` | `/site-visits` | Authenticated | Schedule an in-person or virtual property inspection |
| `PATCH` | `/site-visits/:id` | Staff / Admin | Update inspection status, outcome notes, or reschedule |

---

## 7. Bookings & Token Transactions (`/api/v1/bookings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/bookings` | Authenticated | List booking records and payment progress |
| `POST` | `/bookings` | Authenticated | Create property booking and generate booking receipt |
| `PATCH` | `/bookings/:id` | Accounts / Admin | Update booking status (`token-paid`, `agreement-signed`, `registered`) |

---

## 8. Dashboard Analytics (`/api/v1/analytics`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/dashboard` | Admin / Manager | Real-time counts, pipeline stages, revenue aggregations |

---

## 9. Favorites & Comparisons (`/api/v1/favorites`, `/api/v1/comparisons`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/favorites` | Authenticated | Get current user's bookmarked properties |
| `POST` | `/favorites/toggle` | Authenticated | Add / remove property from user favorites |
| `GET` | `/comparisons` | Authenticated | Get side-by-side comparison tray properties |
| `POST` | `/comparisons` | Authenticated | Set current active comparison property IDs (max 4) |

---

## 10. Notifications (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | Get user notifications and unread count |
| `PATCH` | `/notifications/:id/read` | Authenticated | Mark single notification as read |
| `PATCH` | `/notifications/read-all` | Authenticated | Mark all notifications as read |

---

## 11. Media Uploads (`/api/v1/upload`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/upload` | Authenticated | Upload image (JPEG, PNG, WebP) up to 10MB via multipart form data |
