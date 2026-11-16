/**
 * Grounds & Gates - Geoapify & Leaflet Map Services
 * Handles Tile URLs, Address Autocomplete, Reverse Geocoding, Nearby Places, and Routes
 */

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export const GEOAPIFY_API_KEY: string =
  (import.meta as any).env?.VITE_GEOAPIFY_API_KEY ||
  (import.meta as any).env?.GEOAPIFY_API_KEY ||
  '';

export const isGeoapifyConfigured = (): boolean => {
  return Boolean(GEOAPIFY_API_KEY && GEOAPIFY_API_KEY.trim() !== '' && GEOAPIFY_API_KEY !== 'YOUR_GEOAPIFY_KEY');
};

export const GEOAPIFY_ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a> contributors';

export const getGeoapifyTileUrl = (style: 'osm-bright' | 'osm-bright-smooth' | 'klokantech-basic' = 'osm-bright'): string => {
  if (isGeoapifyConfigured()) {
    return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
  }
  // If no Geoapify key is configured, return empty string so MapContainer can show the honest unavailable banner
  return '';
};

export interface GeoAddressSuggestion {
  placeId: string;
  formatted: string;
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  lat: number;
  lng: number;
}

export interface NearbyFacilityItem {
  name: string;
  category: string;
  distanceMeters?: number;
  distanceLabel?: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
}

export interface RouteEstimateResult {
  distanceMeters: number;
  distanceKm: number;
  distanceLabel: string;
  timeMinutes: number;
  timeLabel: string;
  mode: string;
  coordinates: [number, number][]; // Array of [lon, lat] points
}

/**
 * Autocomplete address suggestions using Geoapify Autocomplete API
 * Biased towards India / Tamil Nadu
 */
export async function autocompleteAddress(
  text: string,
  signal?: AbortSignal
): Promise<GeoAddressSuggestion[]> {
  if (!text || text.trim().length < 2) return [];

  // Try direct Geoapify client call first if browser key is configured
  if (isGeoapifyConfigured()) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        text.trim()
      )}&filter=countrycode:in&bias=countrycode:in&format=json&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data: any = await res.json();
        return (data.results || []).map((item: any) => ({
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
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
    }
  }

  // Fallback to backend proxy /api/v1/geo/autocomplete
  try {
    const url = `${VITE_API_URL}/geo/autocomplete?text=${encodeURIComponent(text.trim())}`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const json: any = await res.json();
      return json.data || [];
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  return [];
}

/**
 * Reverse geocode coordinates to find corresponding address details
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<GeoAddressSuggestion | null> {
  if (isNaN(lat) || isNaN(lng)) return null;

  if (isGeoapifyConfigured()) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data: any = await res.json();
        const item = data.results?.[0];
        if (item) {
          return {
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
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
    }
  }

  // Fallback to backend proxy /api/v1/geo/reverse
  try {
    const url = `${VITE_API_URL}/geo/reverse?lat=${lat}&lng=${lng}`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const json: any = await res.json();
      return json.data || null;
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  return null;
}

const CATEGORY_MAP: Record<string, string> = {
  schools: 'education.school,education.college,education.university',
  hospitals: 'healthcare.hospital,healthcare.pharmacy,healthcare.clinic',
  supermarkets: 'commercial.supermarket,commercial.marketplace',
  banks: 'service.financial.bank,service.financial.atm',
  parks: 'leisure.park',
  transit: 'public_transport,public_transport.bus,public_transport.train',
};

/**
 * Fetch nearby establishments (schools, hospitals, transit, etc.) through Geoapify Places
 */
export async function fetchNearbyFacilities(
  lat: number,
  lng: number,
  category: string,
  radiusMeters = 3000,
  signal?: AbortSignal
): Promise<NearbyFacilityItem[]> {
  if (isNaN(lat) || isNaN(lng)) return [];

  if (isGeoapifyConfigured()) {
    try {
      const apiCategory = CATEGORY_MAP[category] || CATEGORY_MAP.schools;
      const url = `https://api.geoapify.com/v2/places?categories=${apiCategory}&filter=circle:${lng},${lat},${radiusMeters}&bias=proximity:${lng},${lat}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data: any = await res.json();
        return (data.features || []).map((feat: any) => {
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
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
    }
  }

  // Fallback to backend proxy /api/v1/geo/places
  try {
    const url = `${VITE_API_URL}/geo/places?lat=${lat}&lng=${lng}&category=${category}&radius=${radiusMeters}`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const json: any = await res.json();
      return json.data || [];
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  return [];
}

/**
 * Get route estimate (distance and time) using Geoapify Routing API
 */
export async function fetchRouteEstimate(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  mode: 'drive' | 'bicycle' | 'walk' = 'drive',
  signal?: AbortSignal
): Promise<RouteEstimateResult | null> {
  if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) return null;

  if (isGeoapifyConfigured()) {
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}&mode=${mode}&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data: any = await res.json();
        const feature = data.features?.[0];
        if (feature) {
          const props = feature.properties || {};
          const distanceMeters = props.distance || 0;
          const timeSeconds = props.time || 0;
          const distanceKm = Number((distanceMeters / 1000).toFixed(1));
          const timeMinutes = Math.ceil(timeSeconds / 60);
          return {
            distanceMeters,
            distanceKm,
            distanceLabel: `${distanceKm} km`,
            timeMinutes,
            timeLabel: timeMinutes >= 60 ? `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m` : `${timeMinutes} mins`,
            mode,
            coordinates: feature.geometry?.coordinates?.[0] || [],
          };
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
    }
  }

  // Fallback to backend proxy /api/v1/geo/routing
  try {
    const url = `${VITE_API_URL}/geo/routing?from=${fromLat},${fromLng}&to=${toLat},${toLng}&mode=${mode}`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const json: any = await res.json();
      return json.data || null;
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  return null;
}

/**
 * Calculate straight-line distance in km using Haversine formula
 */
export function calculateStraightLineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Generate external directions link to Google Maps or OpenStreetMap
 */
export function getExternalDirectionsUrl(destLat: number, destLng: number, originLat?: number, originLng?: number): string {
  if (originLat !== undefined && originLng !== undefined) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
}

