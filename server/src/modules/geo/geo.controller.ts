import { Request, Response } from 'express';
import { config } from '../../config/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const getApiKey = (req: Request): string => {
  return (
    config.geoapifyApiKey ||
    (req.query.apiKey as string) ||
    process.env.GEOAPIFY_API_KEY ||
    process.env.VITE_GEOAPIFY_API_KEY ||
    ''
  );
};

const getForwardHeaders = (req: Request) => {
  const referer =
    (req.headers.referer as string) ||
    (req.headers.origin as string) ||
    config.clientUrl ||
    'http://localhost:3000';
  return {
    Accept: 'application/json',
    Referer: referer,
  };
};

export const checkGeoapifyStatus = (req: Request, res: Response): void => {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    res.status(200).json({
      success: true,
      configured: false,
      provider: 'Geoapify + Leaflet',
      message: 'Geoapify API key is not configured. Set VITE_GEOAPIFY_API_KEY or GEOAPIFY_API_KEY to enable live tiles, places, and routing.',
    });
    return;
  }
  res.status(200).json({
    success: true,
    configured: true,
    provider: 'Geoapify + Leaflet',
    message: 'Geoapify is configured and operational.',
  });
};

export const autocompleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = getApiKey(req);
    const text = (req.query.text as string) || '';

    if (!text.trim()) {
      successResponse(res, []);
      return;
    }

    if (!apiKey) {
      errorResponse(res, 'Geoapify API key is not configured. Map search service is currently unavailable.', 503);
      return;
    }

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text.trim())}&filter=countrycode:in&bias=countrycode:in&format=json&apiKey=${apiKey}`;
    const response = await fetch(url, { headers: getForwardHeaders(req) });

    if (!response.ok) {
      const errText = await response.text();
      errorResponse(res, `Geoapify provider error (${response.status}): ${errText}`, response.status);
      return;
    }

    const data: any = await response.json();
    const results = (data.results || []).map((item: any) => ({
      placeId: item.place_id,
      formatted: item.formatted,
      addressLine1: item.address_line1 || item.street,
      addressLine2: item.address_line2,
      locality: item.suburb || item.neighbourhood || item.city || item.county,
      district: item.state_district || item.county || item.city,
      state: item.state || 'Tamil Nadu',
      pincode: item.postcode,
      lat: item.lat,
      lng: item.lon,
    }));

    successResponse(res, results);
  } catch (err: any) {
    errorResponse(res, err.message || 'Autocomplete request failed.', 500);
  }
};

export const reverseGeocode = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = getApiKey(req);
    const { lat, lng } = req.query as Record<string, string>;

    if (!lat || !lng) {
      errorResponse(res, 'Latitude and longitude query parameters are required.', 400);
      return;
    }

    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
      errorResponse(res, 'Invalid coordinate bounds.', 400);
      return;
    }

    if (!apiKey) {
      errorResponse(res, 'Geoapify API key is not configured. Reverse geocoding service is unavailable.', 503);
      return;
    }

    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${numLat}&lon=${numLng}&format=json&apiKey=${apiKey}`;
    const response = await fetch(url, { headers: getForwardHeaders(req) });

    if (!response.ok) {
      const errText = await response.text();
      errorResponse(res, `Geoapify provider error: ${errText}`, response.status);
      return;
    }

    const data: any = await response.json();
    const item = data.results?.[0];
    if (!item) {
      errorResponse(res, 'No address found for the given coordinates.', 404);
      return;
    }

    const result = {
      placeId: item.place_id,
      formatted: item.formatted,
      addressLine1: item.address_line1 || item.street,
      addressLine2: item.address_line2,
      locality: item.suburb || item.neighbourhood || item.city || item.county,
      district: item.state_district || item.county || item.city,
      state: item.state || 'Tamil Nadu',
      pincode: item.postcode,
      lat: item.lat,
      lng: item.lon,
    };

    successResponse(res, result);
  } catch (err: any) {
    errorResponse(res, err.message || 'Reverse geocode request failed.', 500);
  }
};

const CATEGORY_MAP: Record<string, string> = {
  schools: 'education.school,education.college,education.university',
  hospitals: 'healthcare.hospital,healthcare.pharmacy,healthcare.clinic',
  supermarkets: 'commercial.supermarket,commercial.marketplace',
  banks: 'service.financial.bank,service.financial.atm',
  parks: 'leisure.park',
  transit: 'public_transport,public_transport.bus,public_transport.train',
};

export const getNearbyFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = getApiKey(req);
    const { lat, lng, category = 'schools', radius = '3000' } = req.query as Record<string, string>;

    if (!lat || !lng) {
      errorResponse(res, 'Latitude and longitude parameters are required.', 400);
      return;
    }

    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    const radiusMeters = Math.min(10000, Math.max(500, parseInt(radius, 10) || 3000));

    if (!apiKey) {
      errorResponse(res, 'Geoapify API key is not configured. Nearby facilities cannot be retrieved.', 503);
      return;
    }

    const apiCategory = CATEGORY_MAP[category] || CATEGORY_MAP.schools;
    const url = `https://api.geoapify.com/v2/places?categories=${apiCategory}&filter=circle:${numLng},${numLat},${radiusMeters}&bias=proximity:${numLng},${numLat}&limit=20&apiKey=${apiKey}`;

    const response = await fetch(url, { headers: getForwardHeaders(req) });
    if (!response.ok) {
      const errText = await response.text();
      errorResponse(res, `Places API error: ${errText}`, response.status);
      return;
    }

    const data: any = await response.json();
    const facilities = (data.features || []).map((feat: any) => {
      const props = feat.properties || {};
      const coords = feat.geometry?.coordinates || [];
      return {
        name: props.name || props.street || 'Facility',
        category,
        distanceMeters: props.distance,
        distanceLabel: props.distance ? `${(props.distance / 1000).toFixed(1)} km` : undefined,
        formattedAddress: props.formatted,
        lat: coords[1],
        lng: coords[0],
      };
    });

    successResponse(res, facilities, 'Nearby facilities fetched successfully', 200, {
      total: facilities.length,
      page: 1,
      limit: facilities.length,
      pages: 1,
    });
  } catch (err: any) {
    errorResponse(res, err.message || 'Facilities request failed.', 500);
  }
};

export const getRouteEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = getApiKey(req);
    const { from, to, mode = 'drive' } = req.query as Record<string, string>;

    if (!from || !to) {
      errorResponse(res, 'Both "from" (lat,lng) and "to" (lat,lng) parameters are required.', 400);
      return;
    }

    if (!apiKey) {
      errorResponse(res, 'Geoapify API key is not configured. Commute routing estimates are unavailable.', 503);
      return;
    }

    const url = `https://api.geoapify.com/v1/routing?waypoints=${from}|${to}&mode=${mode}&apiKey=${apiKey}`;
    const response = await fetch(url, { headers: getForwardHeaders(req) });

    if (!response.ok) {
      const errText = await response.text();
      errorResponse(res, `Routing API error: ${errText}`, response.status);
      return;
    }

    const data: any = await response.json();
    const feature = data.features?.[0];
    if (!feature) {
      errorResponse(res, 'No route found between the specified points.', 404);
      return;
    }

    const props = feature.properties || {};
    const distanceMeters = props.distance || 0;
    const timeSeconds = props.time || 0;
    const distanceKm = Number((distanceMeters / 1000).toFixed(1));
    const timeMinutes = Math.ceil(timeSeconds / 60);

    const result = {
      distanceMeters,
      distanceKm,
      distanceLabel: `${distanceKm} km`,
      timeMinutes,
      timeLabel: timeMinutes >= 60 ? `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m` : `${timeMinutes} mins`,
      mode,
      coordinates: feature.geometry?.coordinates?.[0] || [], // Array of [lon, lat] points for drawing polyline
    };

    successResponse(res, result);
  } catch (err: any) {
    errorResponse(res, err.message || 'Routing estimate failed.', 500);
  }
};
