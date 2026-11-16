import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import Supercluster from 'supercluster';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigationIcon from '@mui/icons-material/Navigation';

import { MapContainer } from './MapContainer';
import { Property, MapMarkerItem, LanguageCode } from '../../types/property';
import { formatPriceINR } from '../../utils/propertyUtils';
import { resolveImageUrl, handleImageError } from '../../utils/imageUrl';

// Helper to format concise map price badges (e.g. ₹38.5L, ₹1.4Cr)
export function formatPriceBadge(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)}Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  }
  return `₹${(price / 1000).toFixed(0)}K`;
}

interface PropertyCatalogMapProps {
  markers: MapMarkerItem[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
  onNavigateProperty?: (slug: string) => void;
  onAreaSearch?: (bbox: string) => void;
  onRadiusSearch?: (lat: number, lng: number, radiusKm: number) => void;
  onResetSearch?: () => void;
  activeRadius?: number | null;
  activeCenter?: { lat: number; lng: number } | null;
  lang?: LanguageCode;
}

export const PropertyCatalogMap: React.FC<PropertyCatalogMapProps> = ({
  markers,
  selectedPropertyId,
  onSelectProperty,
  onNavigateProperty,
  onAreaSearch,
  onRadiusSearch,
  onResetSearch,
  activeRadius,
  activeCenter,
  lang = 'en',
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [hasMapMoved, setHasMapMoved] = useState(false);
  const [autoSearch, setAutoSearch] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(activeRadius || 10);
  const [previewProperty, setPreviewProperty] = useState<MapMarkerItem | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Initialize Supercluster instance
  const clusterIndex = useMemo(() => {
    const points: any[] = markers
      .filter((m) => typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng))
      .map((m) => ({
        type: 'Feature',
        properties: { ...m },
        geometry: {
          type: 'Point',
          coordinates: [m.lng, m.lat],
        },
      }));

    const sc = new Supercluster({
      radius: 50,
      maxZoom: 17,
      minPoints: 2,
    });
    sc.load(points);
    return sc;
  }, [markers]);

  // Render clusters and individual price pin markers
  const renderClusters = () => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const bounds = mapRef.current.getBounds();
    const zoom = Math.floor(mapRef.current.getZoom());

    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const clusters = clusterIndex.getClusters(bbox, zoom);

    clusters.forEach((feat: any) => {
      const [lng, lat] = feat.geometry.coordinates;
      const isCluster = feat.properties.cluster;

      if (isCluster) {
        const count = feat.properties.point_count;
        const clusterId = feat.properties.cluster_id;

        // Cluster HTML badge
        const clusterHtml = `
          <div style="background: linear-gradient(135deg, #013E18 0%, #00280F 100%); color: #F5F2E9; border: 2.5px solid #C99325; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(1, 62, 24, 0.45); cursor: pointer;">
            ${count}
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: 'custom-cluster-icon',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const clusterMarker = L.marker([lat, lng], { icon: clusterIcon }).addTo(markersLayerRef.current!);
        clusterMarker.on('click', () => {
          const expansionZoom = Math.min(clusterIndex.getClusterExpansionZoom(clusterId), 18);
          mapRef.current?.setView([lat, lng], expansionZoom, { animate: true });
        });
      } else {
        const prop: MapMarkerItem = feat.properties;
        const isSelected = selectedPropertyId === prop.id;

        // Price Badge Marker HTML
        const priceText = formatPriceBadge(prop.price);
        const badgeBg = isSelected ? '#C99325' : '#013E18';
        const badgeText = '#FFFFFF';
        const borderColor = isSelected ? '#FFFFFF' : '#C99325';

        const pinHtml = `
          <div style="position: relative; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.15s ease;">
            <div style="background-color: ${badgeBg}; color: ${badgeText}; border: 2px solid ${borderColor}; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 12px; white-space: nowrap; box-shadow: 0 4px 12px rgba(1, 62, 24, 0.35); display: flex; align-items: center; gap: 4px;">
              ${prop.verified ? '<span style="color: #C99325; font-size: 10px;">★</span>' : ''}
              <span>${priceText}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${badgeBg}; margin: -1px auto 0 auto;"></div>
          </div>
        `;

        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'custom-property-pin',
          iconSize: [60, 28],
          iconAnchor: [30, 28],
        });

        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(markersLayerRef.current!);
        marker.on('click', () => {
          setPreviewProperty(prop);
          if (onSelectProperty) {
            onSelectProperty(prop.id);
          }
        });
      }
    });
  };

  // Re-render markers when markers array changes or map updates
  useEffect(() => {
    renderClusters();
  }, [clusterIndex, selectedPropertyId]);

  // Update radius circle
  useEffect(() => {
    if (!mapRef.current) return;

    if (activeCenter && activeRadius) {
      if (circleRef.current) {
        circleRef.current.setLatLng([activeCenter.lat, activeCenter.lng]);
        circleRef.current.setRadius(activeRadius * 1000);
      } else {
        circleRef.current = L.circle([activeCenter.lat, activeCenter.lng], {
          radius: activeRadius * 1000,
          color: '#C99325',
          fillColor: '#C99325',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '6, 6',
        }).addTo(mapRef.current);
      }
    } else if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
  }, [activeCenter, activeRadius]);

  const handleMapMoveEnd = (map: L.Map) => {
    setHasMapMoved(true);
    renderClusters();

    if (autoSearch && onAreaSearch) {
      const b = map.getBounds();
      const bboxStr = `${b.getWest().toFixed(4)},${b.getSouth().toFixed(4)},${b.getEast().toFixed(4)},${b.getNorth().toFixed(4)}`;
      onAreaSearch(bboxStr);
    }
  };

  const handleManualSearchThisArea = () => {
    if (!mapRef.current || !onAreaSearch) return;
    const b = mapRef.current.getBounds();
    const bboxStr = `${b.getWest().toFixed(4)},${b.getSouth().toFixed(4)},${b.getEast().toFixed(4)},${b.getNorth().toFixed(4)}`;
    onAreaSearch(bboxStr);
    setHasMapMoved(false);
  };

  const handleFindNearMe = () => {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const curLat = Number(pos.coords.latitude.toFixed(6));
        const curLng = Number(pos.coords.longitude.toFixed(6));

        if (mapRef.current) {
          mapRef.current.setView([curLat, curLng], 13, { animate: true });
        }

        if (onRadiusSearch) {
          onRadiusSearch(curLat, curLng, selectedRadius);
        }
      },
      () => {
        setIsGeolocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit' }}>
      <MapContainer
        center={activeCenter ? [activeCenter.lat, activeCenter.lng] : [11.0168, 76.9558]}
        zoom={activeRadius ? (activeRadius <= 5 ? 13 : activeRadius <= 15 ? 11 : 10) : 12}
        onMoveEnd={handleMapMoveEnd}
        onMapReady={(map) => {
          mapRef.current = map;
          markersLayerRef.current = L.layerGroup().addTo(map);
          renderClusters();
        }}
      />

      {/* Top Floating Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search This Area Button */}
        {hasMapMoved && onAreaSearch && (
          <Button
            variant="contained"
            size="small"
            onClick={handleManualSearchThisArea}
            startIcon={<SearchIcon sx={{ color: '#C99325' }} />}
            sx={{
              bgcolor: '#013E18',
              color: '#F5F2E9',
              fontWeight: 800,
              borderRadius: '20px',
              px: 2,
              boxShadow: '0 4px 14px rgba(1, 62, 24, 0.35)',
              textTransform: 'none',
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            {lang === 'ta' ? 'இப்பகுதியில் தேடு' : 'Search This Area'}
          </Button>
        )}

        {/* Find Properties Near Me */}
        <Button
          variant="contained"
          size="small"
          onClick={handleFindNearMe}
          disabled={isGeolocating}
          startIcon={<MyLocationIcon sx={{ color: '#C99325', fontSize: 18 }} />}
          sx={{
            bgcolor: '#FFFFFF',
            color: '#18241B',
            fontWeight: 800,
            borderRadius: '20px',
            px: 2,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            textTransform: 'none',
            border: '1px solid #ECE7DA',
            '&:hover': { bgcolor: '#FAF8F2' },
          }}
        >
          {lang === 'ta' ? 'என் அருகில்' : 'Near Me'}
        </Button>

        {/* Radius Selector */}
        {onRadiusSearch && (
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.25,
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: '1px solid #ECE7DA',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', mr: 1 }}>
              {lang === 'ta' ? 'ஆரம்:' : 'Radius:'}
            </Typography>
            <Select
              size="small"
              value={selectedRadius}
              onChange={(e) => {
                const newRad = Number(e.target.value);
                setSelectedRadius(newRad);
                if (activeCenter && onRadiusSearch) {
                  onRadiusSearch(activeCenter.lat, activeCenter.lng, newRad);
                }
              }}
              variant="standard"
              disableUnderline
              sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.82rem' }}
            >
              <MenuItem value={1}>1 km</MenuItem>
              <MenuItem value={3}>3 km</MenuItem>
              <MenuItem value={5}>5 km</MenuItem>
              <MenuItem value={10}>10 km</MenuItem>
              <MenuItem value={25}>25 km</MenuItem>
            </Select>
          </Paper>
        )}

        {/* Reset Location Search Button */}
        {(activeRadius || activeCenter) && onResetSearch && (
          <IconButton
            size="small"
            onClick={onResetSearch}
            title={lang === 'ta' ? 'இருப்பிட வடிப்பானை மீட்டமை' : 'Reset Location Filter'}
            sx={{
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid #ECE7DA',
              '&:hover': { bgcolor: '#FAF8F2' },
            }}
          >
            <RestartAltIcon sx={{ color: '#013E18', fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Bottom Property Preview Popup Card */}
      {previewProperty && (
        <Paper
          elevation={5}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 380,
            zIndex: 1100,
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid #C99325',
            boxShadow: '0 12px 32px rgba(1, 62, 24, 0.22)',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ position: 'relative', height: 130, bgcolor: '#ECE7DA' }}>
            <img
              src={resolveImageUrl(previewProperty.image)}
              alt={previewProperty.title}
              onError={handleImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <IconButton
              size="small"
              onClick={() => setPreviewProperty(null)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: '#FFFFFF',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <Chip
              size="small"
              label={formatPriceINR(previewProperty.price, previewProperty.listingType, previewProperty.priceUnit)}
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                bgcolor: '#013E18',
                color: '#F5F2E9',
                fontWeight: 800,
                border: '1px solid #C99325',
              }}
            />
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B', lineHeight: 1.3, mb: 0.5 }}>
              {previewProperty.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 1.5 }}>
              📍 {previewProperty.locality}, {previewProperty.district}
              {previewProperty.isApproximateLocation && (
                <span style={{ color: '#C99325', marginLeft: 4, fontWeight: 700 }}>(Approximate Area)</span>
              )}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onNavigateProperty && onNavigateProperty(previewProperty.slug)}
              endIcon={<ArrowForwardIcon sx={{ color: '#C99325', fontSize: 16 }} />}
              sx={{ borderRadius: '10px', fontWeight: 800, textTransform: 'none', py: 0.8 }}
            >
              {lang === 'ta' ? 'விவரங்களைப் பார்க்க' : 'View Property Details'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

