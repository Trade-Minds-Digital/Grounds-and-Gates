import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ParkIcon from '@mui/icons-material/Park';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import NavigationIcon from '@mui/icons-material/Navigation';
import CommuteIcon from '@mui/icons-material/Commute';

import { MapContainer } from './MapContainer';
import {
  fetchNearbyFacilities,
  fetchRouteEstimate,
  getExternalDirectionsUrl,
  NearbyFacilityItem,
  RouteEstimateResult,
} from '../../services/geoService';
import { Property, LanguageCode } from '../../types/property';

interface PropertyDetailMapProps {
  property: Property;
  lang?: LanguageCode;
}

export const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({ property, lang = 'en' }) => {
  const lat = property.coordinates?.lat || property.mapCoordinates?.lat || 11.0168;
  const lng = property.coordinates?.lng || property.mapCoordinates?.lng || 76.9558;
  const isApproximate = Boolean(property.isApproximateLocation);

  const mapRef = useRef<L.Map | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [activeTab, setActiveTab] = useState<string>('schools');
  const [facilities, setFacilities] = useState<NearbyFacilityItem[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);

  // Commute state
  const [commuteDestination, setCommuteDestination] = useState('');
  const [routeResult, setRouteResult] = useState<RouteEstimateResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Custom marker icon for property location
  const createPropertyPin = () =>
    L.divIcon({
      className: 'detail-property-pin',
      html: `
        <div style="background-color: #013E18; border: 3px solid #C99325; color: #FFFFFF; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 16px rgba(1, 62, 24, 0.45); display: flex; align-items: center; justify-content: center;">
          <div style="transform: rotate(45deg); color: #C99325; font-size: 16px; font-weight: 800;">★</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

  // Fetch facilities on-demand when active category tab changes
  useEffect(() => {
    let isMounted = true;
    const loadFacilities = async () => {
      setIsLoadingFacilities(true);
      try {
        const results = await fetchNearbyFacilities(lat, lng, activeTab, 5000);
        if (isMounted) {
          setFacilities(results);
          renderFacilityPins(results);
        }
      } catch (err) {
        if (isMounted) setFacilities([]);
      } finally {
        if (isMounted) setIsLoadingFacilities(false);
      }
    };

    loadFacilities();
    return () => {
      isMounted = false;
    };
  }, [activeTab, lat, lng]);

  const renderFacilityPins = (items: NearbyFacilityItem[]) => {
    if (!mapRef.current || !facilitiesLayerRef.current) return;
    facilitiesLayerRef.current.clearLayers();

    items.forEach((fac) => {
      const pinHtml = `
        <div style="background-color: #FAF8F2; border: 1.5px solid #013E18; color: #013E18; padding: 2px 6px; border-radius: 12px; font-weight: 700; font-size: 10px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          ${fac.name.slice(0, 18)}
        </div>
      `;
      const icon = L.divIcon({
        html: pinHtml,
        className: 'facility-pin',
        iconSize: [80, 20],
      });

      const m = L.marker([fac.lat, fac.lng], { icon }).addTo(facilitiesLayerRef.current!);
      m.bindPopup(`<strong>${fac.name}</strong><br/>${fac.distanceLabel ? `${fac.distanceLabel} away` : ''}`);
    });
  };

  // Calculate commute route
  const handleCalculateCommute = async () => {
    if (!commuteDestination.trim()) return;
    setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      // For demonstration and real Tamil Nadu destinations, resolve popular destinations or default to city center
      const destCoords: Record<string, [number, number]> = {
        airport: [11.0298, 77.0434],
        railway: [10.9984, 76.9669],
        'tech park': [11.0827, 76.9961],
        hospital: [11.0265, 77.0125],
      };

      const key = commuteDestination.toLowerCase();
      let targetCoords: [number, number] = [lat + 0.04, lng + 0.04]; // default 4km away

      Object.entries(destCoords).forEach(([k, v]) => {
        if (key.includes(k)) targetCoords = v;
      });

      const route = await fetchRouteEstimate(lat, lng, targetCoords[0], targetCoords[1], 'drive');
      if (route && route.coordinates && route.coordinates.length > 0) {
        setRouteResult(route);

        if (mapRef.current) {
          if (routePolylineRef.current) {
            routePolylineRef.current.remove();
          }

          // Leaflet polyline expects [lat, lng] array
          const polyPoints: [number, number][] = route.coordinates.map((c) => [c[1], c[0]]);
          routePolylineRef.current = L.polyline(polyPoints, {
            color: '#013E18',
            weight: 5,
            opacity: 0.8,
            dashArray: '1, 6',
          }).addTo(mapRef.current);

          mapRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
        }
      } else {
        setRouteError('Route service is currently unavailable. You can use external directions.');
      }
    } catch (err: any) {
      setRouteError(err.message || 'Unable to calculate commute.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const externalDirectionsUrl = getExternalDirectionsUrl(lat, lng);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top Header & External Directions Link */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'இருப்பிடம் & அருகிலுள்ள வசதிகள்' : 'Property Location & Vicinity'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            {property.address || `${property.location}, ${property.district}, Tamil Nadu - ${property.pincode}`}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          href={externalDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<DirectionsIcon sx={{ color: '#C99325' }} />}
          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
          sx={{
            borderColor: '#013E18',
            color: '#013E18',
            fontWeight: 700,
            borderRadius: '12px',
            textTransform: 'none',
            px: 2,
            '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.06)', borderColor: '#013E18' },
          }}
        >
          {lang === 'ta' ? 'திசைகளைப் பெறுக (Google Maps)' : 'Get Directions'}
        </Button>
      </Box>

      {/* Map Container */}
      <Box
        sx={{
          height: 380,
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #ECE7DA',
          boxShadow: '0 4px 20px rgba(1, 62, 24, 0.08)',
          position: 'relative',
        }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          onMapReady={(map) => {
            mapRef.current = map;
            facilitiesLayerRef.current = L.layerGroup().addTo(map);

            if (isApproximate) {
              L.circle([lat, lng], {
                radius: 600,
                color: '#C99325',
                fillColor: '#C99325',
                fillOpacity: 0.18,
                weight: 2,
              }).addTo(map);
            } else {
              const marker = L.marker([lat, lng], { icon: createPropertyPin() }).addTo(map);
              marker.bindPopup(`<strong>${property.title}</strong><br/>${property.location}, ${property.district}`).openPopup();
            }
          }}
        />

        {isApproximate && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              zIndex: 1000,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              border: '1px solid #C99325',
            }}
          >
            <Typography variant="caption" sx={{ color: '#8B6413', fontWeight: 700 }}>
              🔒 Approximate Area Circle Shown (Exact pinpoint available upon confirmed site visit)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Nearby Facilities Tabs (Geoapify Places) */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#FFFFFF', border: '1px solid #ECE7DA' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B', mb: 1.5 }}>
          {lang === 'ta' ? 'அருகிலுள்ள இடங்கள் & தூரம் (Geoapify Places)' : 'Nearby Establishments & Services'}
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            borderBottom: '1px solid #ECE7DA',
            mb: 2,
            '& .MuiTab-root': {
              minHeight: 40,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              color: '#536458',
              '&.Mui-selected': { color: '#013E18' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#013E18', height: 3 },
          }}
        >
          <Tab icon={<SchoolIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Schools & Colleges" value="schools" />
          <Tab icon={<LocalHospitalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Hospitals & Clinics" value="hospitals" />
          <Tab icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Supermarkets" value="supermarkets" />
          <Tab icon={<AccountBalanceIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Banks & ATMs" value="banks" />
          <Tab icon={<ParkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Parks & Recreation" value="parks" />
          <Tab icon={<DirectionsBusIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Transit & Bus" value="transit" />
        </Tabs>

        {isLoadingFacilities ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#013E18' }} />
          </Box>
        ) : facilities.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {facilities.map((fac, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: '#FAF8F2',
                  border: '1px solid #ECE7DA',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#18241B', fontSize: '0.82rem' }}>
                  {fac.name}
                </Typography>
                {fac.distanceLabel && (
                  <Chip
                    size="small"
                    label={fac.distanceLabel}
                    sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: '#536458', fontStyle: 'italic' }}>
            No nearby facilities found within 5 km for this category or service offline.
          </Typography>
        )}
      </Paper>

      {/* Check Commute Section */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#FAF8F2', border: '1px solid #ECE7DA' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CommuteIcon sx={{ color: '#C99325', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'பயண நேரம் கணக்கீடு (Geoapify Routing)' : 'Check Commute Time & Distance'}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 2 }}>
          {lang === 'ta'
            ? 'உங்கள் பணியிடம், பள்ளி அல்லது ஏர்போர்ட் தூரத்தைக் கணக்கிடுங்கள்.'
            : 'Estimate real driving distance and duration to your workplace, school, or airport.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="e.g. Coimbatore Airport, KMCH, Tech Park..."
            value={commuteDestination}
            onChange={(e) => setCommuteDestination(e.target.value)}
            sx={{ flex: 1, minWidth: 240, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <Button
            variant="contained"
            size="small"
            onClick={handleCalculateCommute}
            disabled={isCalculatingRoute || !commuteDestination.trim()}
            startIcon={isCalculatingRoute ? <CircularProgress size={16} /> : <NavigationIcon sx={{ color: '#C99325' }} />}
            sx={{
              bgcolor: '#013E18',
              color: '#F5F2E9',
              fontWeight: 800,
              borderRadius: '10px',
              px: 2.5,
              textTransform: 'none',
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            {lang === 'ta' ? 'கணக்கிடு' : 'Calculate Commute'}
          </Button>
        </Box>

        {routeResult && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: '10px',
              bgcolor: '#DCFCE7',
              border: '1px solid #86EFAC',
              display: 'flex',
              gap: 3,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                Driving Distance:
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#14532D', fontWeight: 800 }}>
                {routeResult.distanceLabel}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                Estimated Travel Time:
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#14532D', fontWeight: 800 }}>
                ~{routeResult.timeLabel} ({routeResult.mode})
              </Typography>
            </Box>
          </Box>
        )}

        {routeError && (
          <Typography variant="caption" sx={{ color: '#B91C1C', mt: 1, display: 'block' }}>
            {routeError}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};
