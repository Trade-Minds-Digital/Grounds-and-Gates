# Grounds & Gates — MongoDB Database Schema & Architecture

Grounds & Gates utilizes MongoDB via Mongoose with strict schema typing, referential consistency, index optimization, and automated audit trails.

---

## Entity Relationship Overview

```
                      +------------------+
                      |       User       |<-----------+
                      +------------------+            |
                               |                      |
             +-----------------+-----------------+    |
             |                 |                 |    |
     +-------v-------+ +-------v-------+ +-------v----+----+
     |   Customer    | |   Employee    | |      Agent      |
     +---------------+ +---------------+ +-----------------+
             |                 |                 |
             |                 |                 |
             |                 +-----------+     |
             |                             |     |
             v                             v     v
     +---------------+             +-----------------+
     |     Lead      |------------>|    Property     |<---+
     +---------------+             +-----------------+    |
       |           |                        |             |
       v           v                        v             |
+------------+ +------------+       +---------------+     |
| SiteVisit  | |  Booking   |       |    Project    |-----+
+------------+ +------------+       +---------------+
       |           |                        |
       |           |                        v
       |           |                +---------------+
       |           |                |   Developer   |
       |           |                +---------------+
       +-----+-----+
             |
             v
     +---------------+
     |   Activity    |
     +---------------+
```

---

## The 21 Collections & Schemas

### 1. `users`
- **Fields**: `_id`, `fullName`, `email` (unique index), `passwordHash`, `mobile` (index), `role` (`super-admin`, `admin`, `sales-manager`, `sales-executive`, `agent`, `seller`, `buyer`), `avatarUrl`, `accountStatus` (`active`, `suspended`, `pending`), `lastLoginAt`, `refreshTokenHash`, `timestamps`.

### 2. `roles`
- **Fields**: `name` (unique index), `slug` (unique index), `description`, `permissions` (array of strings), `isSystemRole`, `timestamps`.

### 3. `permissions`
- **Fields**: `name` (unique index), `slug` (unique index), `module`, `action` (`create`, `read`, `update`, `delete`, `export`), `description`, `timestamps`.

### 4. `developers`
- **Fields**: `referenceId` (unique index), `slug` (unique index), `name`, `tamilName`, `brandColor`, `logoUrl`, `experienceYears`, `completedProjects`, `ongoingProjects`, `headquarters`, `city`, `district`, `website`, `contactPhone`, `contactEmail`, `verified`, `rating`, `timestamps`.

### 5. `projects`
- **Fields**: `referenceId` (unique index), `slug` (unique index), `developer` (Ref: Developer), `developerId`, `name`, `tamilName`, `tagline`, `description`, `location`, `district`, `city`, `pincode`, `status` (`planning`, `under-construction`, `ready-to-occupy`, `completed`), `totalUnits`, `availableUnits`, `priceMin`, `priceMax`, `masterPlanUrl`, `galleryImages`, `amenities`, `reraApproved`, `reraNumber`, `dtcpApproved`, `timestamps`.

### 6. `properties`
- **Fields**: `referenceId` (unique index), `slug` (unique index), `title`, `tamilTitle`, `description`, `category` (`residential-plots`, `agricultural-land`, `independent-houses`, `villas`, `apartments`, `commercial-properties`), `listingType` (`buy`, `rent`), `ownershipType` (`company`, `third-party`), `price`, `priceUnit`, `negotiable`, `plotArea`, `plotAreaUnit` (`cents`, `sq.ft`, `acres`), `builtUpArea`, `builtUpAreaUnit`, `bedrooms`, `bathrooms`, `facing`, `district`, `city`, `locality`, `pincode`, `coordinates` (`lat`, `lng`), `images`, `sellerInfo`, `project` (Ref: Project), `projectId`, `developer` (Ref: Developer), `approvalAuthority`, `dtcpApproved`, `cmdaApproved`, `reraId`, `waterSource`, `status` (`active`, `under-negotiation`, `sold`), `availability`, `verified`, `featured`, `published`, `viewsCount`, `enquiriesCount`, `createdBy` (Ref: User), `timestamps`.
- **Indexes**: Compound `{ district: 1, locality: 1 }`, Compound `{ category: 1, listingType: 1 }`, Single `{ price: 1 }`, Compound `{ status: 1, availability: 1, published: 1 }`, Text `{ title: "text", description: "text", locality: "text" }`.

### 7. `agents`
- **Fields**: `user` (Ref: User), `referenceId`, `agencyName`, `reraNumber`, `licenseNumber`, `experienceYears`, `specialties`, `operatingDistricts`, `activeListingsCount`, `rating`, `timestamps`.

### 8. `customers`
- **Fields**: `user` (Ref: User), `referenceId` (unique index), `name`, `phone`, `email`, `city`, `district`, `preferredCategories`, `budgetMin`, `budgetMax`, `isActive`, `timestamps`.

### 9. `employees`
- **Fields**: `user` (Ref: User), `referenceId` (unique index), `name`, `phone`, `email`, `roleTitle`, `department` (`sales`, `crm`, `legal`, `marketing`), `assignedDistricts`, `activeLeadsCount`, `totalClosedDeals`, `isActive`, `timestamps`.

### 10. `leads`
- **Fields**: `referenceId` (unique index), `customer` (Ref: Customer), `customerId`, `buyerName`, `phone`, `email`, `property` (Ref: Property), `propertyId`, `propertyTitle`, `stage` (`new`, `contacted`, `qualified`, `scheduled`, `negotiation`, `won`, `lost`), `priority` (`low`, `medium`, `high`, `urgent`), `assignedEmployee` (Ref: Employee), `assignedEmployeeId`, `source` (`website`, `enquiry-modal`, `call`, `direct-walkin`), `notes`, `scheduledVisitDate`, `budget`, `timestamps`.
- **Indexes**: Single `{ stage: 1 }`, Single `{ priority: 1 }`, Compound `{ assignedEmployeeId: 1, stage: 1 }`.

### 11. `enquiries`
- **Fields**: `referenceId` (unique index), `property` (Ref: Property), `propertyId`, `customer` (Ref: Customer), `fullName`, `phone`, `email`, `message`, `visitDate`, `preferredTimeSlot`, `status` (`pending`, `confirmed`, `completed`, `cancelled`), `convertedToLead` (Ref: Lead), `timestamps`.

### 12. `site_visits`
- **Fields**: `referenceId` (unique index), `lead` (Ref: Lead), `leadId`, `property` (Ref: Property), `propertyId`, `propertyTitle`, `customer` (Ref: Customer), `customerId`, `customerName`, `customerPhone`, `assignedEmployee` (Ref: Employee), `assignedEmployeeId`, `date`, `timeSlot` (`morning`, `afternoon`, `evening`), `status` (`scheduled`, `completed`, `cancelled`, `no-show`), `notes`, `transportProvided`, `feedbackRating`, `timestamps`.
- **Indexes**: Compound `{ propertyId: 1, date: 1 }`, Single `{ assignedEmployeeId: 1 }`, Single `{ status: 1 }`.

### 13. `bookings`
- **Fields**: `referenceId` (unique index), `bookingNumber` (unique index), `property` (Ref: Property), `propertyId`, `propertyTitle`, `customer` (Ref: Customer), `customerId`, `customerName`, `lead` (Ref: Lead), `leadId`, `tokenAmount`, `totalAmount`, `paymentMode` (`bank-transfer`, `cheque`, `upi`, `cash`), `paymentStatus` (`pending`, `paid`, `cleared`), `bookingStatus` (`confirmed`, `cancelled`, `registered`), `agreementDate`, `registrationDate`, `notes`, `timestamps`.
- **Indexes**: Single `{ bookingNumber: 1 }`, Compound `{ propertyId: 1, bookingStatus: 1 }`.

### 14. `activities`
- **Fields**: `referenceId` (unique index), `entityType` (`lead`, `property`, `site-visit`, `booking`), `entityId`, `type` (`call`, `site-visit`, `note`, `token`, `status-change`), `title`, `description`, `performedBy`, `timestamp`, `timestamps`.

### 15. `notifications`
- **Fields**: `referenceId` (unique index), `user` (Ref: User), `recipientRole`, `title`, `message`, `type` (`lead`, `visit`, `booking`, `status`, `system`), `read`, `actionView`, `timestamps`.

### 16. `favorites`
- **Fields**: `user` (Ref: User), `property` (Ref: Property), `propertyId`, `timestamps`.
- **Index**: Unique Compound `{ user: 1, property: 1 }`.

### 17. `comparisons`
- **Fields**: `user` (Ref: User), `properties` (array of Ref: Property), `propertyIds` (array of strings, max 4), `timestamps`.

### 18. `documents`
- **Fields**: `referenceId` (unique index), `title`, `category` (`patta`, `chitta`, `dtcp-approval`, `rera-certificate`, `encumbrance`, `sale-deed`), `fileUrl`, `fileType`, `fileSize`, `property` (Ref: Property), `verified`, `timestamps`.

### 19. `reviews`
- **Fields**: `user` (Ref: User), `property` (Ref: Property), `developer` (Ref: Developer), `rating` (1-5), `title`, `comment`, `verifiedBuyer`, `approved`, `timestamps`.

### 20. `system_settings`
- **Fields**: `key` (unique index), `value`, `group` (`general`, `email`, `sms`, `branding`), `description`, `timestamps`.

### 21. `audit_logs`
- **Fields**: `user` (Ref: User), `action`, `resource`, `resourceId`, `ipAddress`, `userAgent`, `changes`, `timestamp`.
