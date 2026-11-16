import { Router } from 'express';
import { checkGeoapifyStatus, autocompleteAddress, reverseGeocode, getNearbyFacilities, getRouteEstimate, } from './geo.controller.js';
const router = Router();
router.get('/status', checkGeoapifyStatus);
router.get('/autocomplete', autocompleteAddress);
router.get('/reverse', reverseGeocode);
router.get('/places', getNearbyFacilities);
router.get('/routing', getRouteEstimate);
export default router;
