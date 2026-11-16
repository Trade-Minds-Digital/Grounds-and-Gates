import { Router } from 'express';
import {
  getProperties,
  getMapMarkers,
  getPropertyByIdOrSlug,
  getMyDraftProperty,
  getSellerPropertyByIdOrSlug,
  getMySellerProperties,
  getAdminPropertyByIdOrSlug,
  getAdminProperties,
  updatePropertyPublishStatus,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  reviewPropertyVerification,
} from './properties.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

// Specialized / subpath endpoints MUST be declared before /:idOrSlug
router.get('/map-markers', getMapMarkers);
router.get('/drafts/mine', authenticate, getMyDraftProperty);
router.get('/seller/mine', authenticate, getMySellerProperties);
router.get('/seller/:idOrSlug', authenticate, getSellerPropertyByIdOrSlug);
router.get('/seller/preview/:idOrSlug', authenticate, getSellerPropertyByIdOrSlug);
router.get(
  '/admin/review/:idOrSlug',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager', 'sales-manager'),
  getAdminPropertyByIdOrSlug
);
router.get(
  '/manage',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager', 'sales-manager'),
  getAdminProperties
);
router.patch(
  '/:id/publish-status',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager'),
  updatePropertyPublishStatus
);

router.get('/', getProperties);
router.get('/:idOrSlug', getPropertyByIdOrSlug);

router.post(
  '/',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'developer', 'seller'),
  createProperty
);
router.patch(
  '/:id',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'agent', 'developer', 'seller'),
  updateProperty
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive', 'listing-manager'),
  updatePropertyStatus
);
router.post(
  '/:id/review',
  authenticate,
  requireRole('super-admin', 'admin', 'listing-manager'),
  reviewPropertyVerification
);
router.delete(
  '/:id',
  authenticate,
  requireRole('super-admin', 'admin'),
  deleteProperty
);

export default router;
