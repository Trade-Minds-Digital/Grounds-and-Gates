import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';

import { MapContainer } from './MapContainer';
import {
  autocompleteAddress,
  reverseGeocode,
  GeoAddressSuggestion,
  isGeoapifyConfigured,
} from '../../services/geoService';
import { LanguageCode } from '../../types/property';

// Custom branded Leaflet marker icon using Grounds & Gates Gold and Green
const createPickerIcon = () =>
  L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: #013E18; border: 3px solid #C99325; color: #F5F2E9; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(1, 62, 24, 0.4); display: flex; align-items: center; justify-content: center;">
          <div style="transform: rotate(45deg); width: 10px; height: 10px; background-color: #C99325; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

export interface LocationPickerValue {
  lat: number;
  lng: number;
  address?: string;
  locality?: string;
  district?: string;
  pincode?: string;
  confirmed: boolean;
  isApproximate?: boolean;
}

export interface PropertyLocationPickerProps {
  value?: Partial<LocationPickerValue>;
  onChange: (value: LocationPickerValue) => void;
  lang?: LanguageCode;
  readOnly?: boolean;
}

export const PropertyLocationPicker: React.FC<PropertyLocationPickerProps> = ({
  value,
  onChange,
  lang = 'en',
  readOnly = false,
}) => {
  const [lat, setLat] = useState<number>(value?.lat || 11.0168);
  const [lng, setLng] = useState<number>(value?.lng || 76.9558);
  const [address, setAddress] = useState<string>(value?.address || '');
  const [locality, setLocality] = useState<string>(value?.locality || '');
  const [district, setDistrict] = useState<string>(value?.district || '');
  const [pincode, setPincode] = useState<string>(value?.pincode || '');
  const [confirmed, setConfirmed] = useState<boolean>(value?.confirmed || false);
  const [isApproximate, setIsApproximate] = useState<boolean>(value?.isApproximate || false);

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<GeoAddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setLat(value.lat);
      setLng(value.lng);
      if (value.address) setAddress(value.address);
      if (value.locality) setLocality(value.locality);
      if (value.district) setDistrict(value.district);
      if (value.pincode) setPincode(value.pincode);
      if (value.confirmed !== undefined) setConfirmed(value.confirmed);
      if (value.isApproximate !== undefined) setIsApproximate(value.isApproximate);
    }
  }, [value?.lat, value?.lng, value?.confirmed]);

  // Autocomplete debounced search
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setGeoError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim() || text.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await autocompleteAddress(text);
        setSuggestions(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Autocomplete error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (s: GeoAddressSuggestion) => {
    setLat(s.lat);
    setLng(s.lng);
    setAddress(s.formatted);
    if (s.locality) setLocality(s.locality);
    if (s.district) setDistrict(s.district);
    if (s.pincode) setPincode(s.pincode);
    setSuggestions([]);
    setSearchText('');
    setConfirmed(false); // User must explicitly confirm position

    if (mapRef.current) {
      mapRef.current.setView([s.lat, s.lng], 16, { animate: true });
      updateMarkerPosition(s.lat, s.lng);
    }
  };

  // Click on map to set position
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (readOnly) return;
    const clickLat = Number(e.latlng.lat.toFixed(6));
    const clickLng = Number(e.latlng.lng.toFixed(6));

    setLat(clickLat);
    setLng(clickLng);
    setConfirmed(false);
    updateMarkerPosition(clickLat, clickLng);

    // Auto reverse-geocode to suggest address components
    try {
      const geoResult = await reverseGeocode(clickLat, clickLng);
      if (geoResult) {
        setAddress(geoResult.formatted);
        if (geoResult.locality) setLocality(geoResult.locality);
        if (geoResult.district) setDistrict(geoResult.district);
        if (geoResult.pincode) setPincode(geoResult.pincode);
      }
    } catch {}
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(lang === 'ta' ? 'உங்கள் உலாவியில் இருப்பிட வசதி ஆதரிக்கப்படவில்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const curLat = Number(pos.coords.latitude.toFixed(6));
        const curLng = Number(pos.coords.longitude.toFixed(6));
        setLat(curLat);
        setLng(curLng);
        setConfirmed(false);
        setIsGeolocating(false);

        if (mapRef.current) {
          mapRef.current.setView([curLat, curLng], 16, { animate: true });
          updateMarkerPosition(curLat, curLng);
        }

        try {
          const res = await reverseGeocode(curLat, curLng);
          if (res) {
            setAddress(res.formatted);
            if (res.locality) setLocality(res.locality);
            if (res.district) setDistrict(res.district);
            if (res.pincode) setPincode(res.pincode);
          }
        } catch {}
      },
      (err) => {
        setIsGeolocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(lang === 'ta' ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. வரைபடத்தில் கைமுறையாக தேர்ந்தெடுக்கவும்.' : 'Location permission was denied. You can select the location on the map manually.');
        } else {
          setGeoError(lang === 'ta' ? 'தற்போதைய இருப்பிடத்தைப் பெற முடியவில்லை.' : 'Unable to acquire current location. Please enter or pick coordinates manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const updateMarkerPosition = (mLat: number, mLng: number) => {
    if (!mapRef.current) return;

    if (!markerRef.current) {
      const marker = L.marker([mLat, mLng], {
        icon: createPickerIcon(),
        draggable: !readOnly,
      }).addTo(mapRef.current);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const dLat = Number(pos.lat.toFixed(6));
        const dLng = Number(pos.lng.toFixed(6));
        setLat(dLat);
        setLng(dLng);
        setConfirmed(false);

        try {
          const rev = await reverseGeocode(dLat, dLng);
          if (rev) {
            setAddress(rev.formatted);
            if (rev.locality) setLocality(rev.locality);
            if (rev.district) setDistrict(rev.district);
            if (rev.pincode) setPincode(rev.pincode);
          }
        } catch {}
      });

      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([mLat, mLng]);
    }
  };

  // Manual coordinate input change
  const handleCoordChange = (newLat: number, newLng: number) => {
    if (isNaN(newLat) || isNaN(newLng)) return;
    setLat(newLat);
    setLng(newLng);
    setConfirmed(false);

    if (mapRef.current && newLat >= -90 && newLat <= 90 && newLng >= -180 && newLng <= 180) {
      mapRef.current.setView([newLat, newLng], mapRef.current.getZoom(), { animate: true });
      updateMarkerPosition(newLat, newLng);
    }
  };

  // Confirm Location Button
  const handleConfirmLocation = () => {
    setConfirmed(true);
    onChange({
      lat,
      lng,
      address,
      locality,
      district,
      pincode,
      confirmed: true,
      isApproximate,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top Search & Actions Bar */}
      {!readOnly && (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={lang === 'ta' ? 'முகவரி, பகுதி, அல்லது அடையாளத்தைத் தேடுங்கள்...' : 'Search by address, landmark, locality, or PIN code...'}
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {isSearching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon sx={{ color: '#013E18', fontSize: 20 }} />}
                    </InputAdornment>
                  ),
                  endAdornment: searchText ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchText('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
              }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={handleUseCurrentLocation}
              disabled={isGeolocating}
              startIcon={isGeolocating ? <CircularProgress size={16} /> : <MyLocationIcon />}
              sx={{
                borderColor: '#013E18',
                color: '#013E18',
                fontWeight: 700,
                borderRadius: '12px',
                px: 2,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.06)', borderColor: '#013E18' },
              }}
            >
              {lang === 'ta' ? 'என் இருப்பிடம்' : 'Near Me'}
            </Button>
          </Box>

          {/* Autocomplete Dropdown List */}
          {suggestions.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1200,
                mt: 0.5,
                borderRadius: '12px',
                maxHeight: 240,
                overflowY: 'auto',
                border: '1px solid #ECE7DA',
              }}
            >
              <List dense disablePadding>
                {suggestions.map((s, idx) => (
                  <ListItemButton
                    key={s.placeId || idx}
                    onClick={() => handleSelectSuggestion(s)}
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #F5F2E9',
                      '&:hover': { bgcolor: '#FAF8F2' },
                    }}
                  >
                    <LocationOnIcon sx={{ color: '#C99325', fontSize: 18, mr: 1.5 }} />
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600, color: '#18241B' }}>{s.formatted}</Typography>}
                      secondary={s.district ? <Typography variant="caption" sx={{ color: '#536458' }}>{s.locality ? `${s.locality}, ` : ''}{s.district}, {s.state}</Typography> : null}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}

      {geoError && (
        <Alert severity="warning" onClose={() => setGeoError(null)} sx={{ borderRadius: '12px' }}>
          {geoError}
        </Alert>
      )}

      {/* Interactive Leaflet Map Container */}
      <Box
        sx={{
          height: 320,
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #ECE7DA',
          boxShadow: '0 4px 20px rgba(1, 62, 24, 0.06)',
          position: 'relative',
        }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          onClick={handleMapClick}
          onMapReady={(map) => {
            mapRef.current = map;
            updateMarkerPosition(lat, lng);
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 1000,
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
            border: '1px solid rgba(24, 36, 27, 0.1)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, fontSize: '0.72rem' }}>
            {lang === 'ta' ? 'வரைபடத்தில் கிளிக் செய்து அல்லது மார்க்கரை இழுத்து இருப்பிடத்தை மாற்றவும்' : 'Click map or drag pin to adjust exact coordinates'}
          </Typography>
        </Box>
      </Box>

      {/* Coordinate & Address Confirmation Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FAF8F2',
          border: '1px solid #ECE7DA',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Latitude"
            type="number"
            value={lat}
            onChange={(e) => handleCoordChange(parseFloat(e.target.value), lng)}
            disabled={readOnly}
            slotProps={{ htmlInput: { step: '0.000001' } }}
            sx={{ bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <TextField
            size="small"
            label="Longitude"
            type="number"
            value={lng}
            onChange={(e) => handleCoordChange(lat, parseFloat(e.target.value))}
            disabled={readOnly}
            slotProps={{ htmlInput: { step: '0.000001' } }}
            sx={{ bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <Box>
            <Chip
              icon={confirmed ? <CheckCircleIcon sx={{ color: '#013E18 !important' }} /> : <EditLocationAltIcon sx={{ color: '#8B6413 !important' }} />}
              label={confirmed ? (lang === 'ta' ? 'இருப்பிடம் உறுதிசெய்யப்பட்டது' : 'Location Confirmed') : (lang === 'ta' ? 'உறுதிப்படுத்தப்படவில்லை' : 'Unconfirmed Pin')}
              size="small"
              sx={{
                bgcolor: confirmed ? '#DCFCE7' : '#FEF3C7',
                color: confirmed ? '#013E18' : '#8B6413',
                fontWeight: 700,
                width: '100%',
                py: 2,
              }}
            />
          </Box>

          {!readOnly && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmLocation}
              startIcon={<VerifiedIcon sx={{ color: '#C99325' }} />}
              sx={{
                py: 1,
                px: 2.5,
                borderRadius: '10px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                textTransform: 'none',
              }}
            >
              {lang === 'ta' ? 'இருப்பிடத்தை உறுதிப்படுத்து' : 'Confirm Location'}
            </Button>
          )}
        </Box>

        {address && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #ECE7DA' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#013E18' }}>
              {lang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட முகவரி:' : 'Resolved Location Address:'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#18241B', fontSize: '0.85rem' }}>
              {address}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
