import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getGeoapifyTileUrl, GEOAPIFY_ATTRIBUTION, isGeoapifyConfigured } from '../../services/geoService';
import { Box, Typography, Button, Alert } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface MapContainerProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: (map: L.Map) => React.ReactNode;
  onMapReady?: (map: L.Map) => void;
  onMoveEnd?: (map: L.Map) => void;
  onClick?: (e: L.LeafletMouseEvent) => void;
}

// Default center: Coimbatore, Tamil Nadu
const DEFAULT_CENTER: [number, number] = [11.0168, 76.9558];
const DEFAULT_ZOOM = 12;

export const MapContainer: React.FC<MapContainerProps> = ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  minZoom = 5,
  maxZoom = 19,
  className = '',
  style = { height: '100%', width: '100%' },
  children,
  onMapReady,
  onMoveEnd,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const isConfigured = isGeoapifyConfigured();

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate map instances in React StrictMode
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center,
      zoom,
      minZoom,
      maxZoom,
      zoomControl: false, // We will add zoom control in top-right
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // If Geoapify key is configured, load high-res Geoapify tiles
    const tileUrl = getGeoapifyTileUrl('osm-bright');
    if (tileUrl) {
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        id: 'osm-bright',
        attribution: GEOAPIFY_ATTRIBUTION,
      }).addTo(map);
      tileLayerRef.current = tileLayer;
    }

    if (onClick) {
      map.on('click', onClick);
    }

    if (onMoveEnd) {
      map.on('moveend', () => onMoveEnd(map));
    }

    mapInstanceRef.current = map;
    setMapReady(true);
    if (onMapReady) {
      onMapReady(map);
    }

    // Invalidate size once container mounts
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update center when prop changes dynamically
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      const current = mapInstanceRef.current.getCenter();
      if (Math.abs(current.lat - center[0]) > 0.0001 || Math.abs(current.lng - center[1]) > 0.0001) {
        mapInstanceRef.current.setView(center, zoom, { animate: true });
      }
    }
  }, [center[0], center[1], zoom]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 280, ...style }} className={className}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />

      {!isConfigured && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 54, // Leave space for zoom control
            zIndex: 1000,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            p: 1.5,
            borderRadius: '12px',
            border: '1px solid #E2D9C8',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#8B6413' }}>
            <WarningAmberIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
              Geoapify Map Provider Offline
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#536458', display: 'block', mt: 0.25, fontSize: '0.72rem' }}>
            To activate interactive map tiles and geocoding, configure <code>VITE_GEOAPIFY_API_KEY</code> in your environment.
          </Typography>
        </Box>
      )}

      {mapReady && mapInstanceRef.current && children && children(mapInstanceRef.current)}
    </Box>
  );
};

