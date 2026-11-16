import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';
import { Property, LanguageCode, MapMarkerItem } from '../../types/property';
import { formatPriceINR } from '../../utils/propertyUtils';
import { resolveImageUrl, handleImageError } from '../../utils/imageUrl';
import { getGeoapifyTileUrl, GEOAPIFY_ATTRIBUTION } from '../../services/geoService';
import { useMapMarkers } from '../../query/hooks/usePropertyQueries';

// MUI Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationIcon from '@mui/icons-material/Navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExploreIcon from '@mui/icons-material/Explore';
import CloseIcon from '@mui/icons-material/Close';

export interface InteractiveDiscoveryMapProps {
  properties: Property[];
  lang: LanguageCode;
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onSelectProperty: (id: string) => void;
  savedPropertyIds?: string[];
  onToggleSave?: (id: string) => void;
}

import { REGIONAL_HUBS, RegionalHubConfig, formatPriceBadge } from './regionalHubs';
export { REGIONAL_HUBS };
export type { RegionalHubConfig };

// Helper to format concise map price badges (e.g. ₹38.5L, ₹1.4Cr)

// Tamil Nadu bounds for initial fit and reset
const TN_BOUNDS: L.LatLngBoundsExpression = [
  [8.08, 76.15],
  [13.55, 80.35],
];
const TN_CENTER: [number, number] = [11.1271, 78.6569];
const TN_DEFAULT_ZOOM = 7;

export const InteractiveDiscoveryMap: React.FC<InteractiveDiscoveryMapProps> = ({
  properties,
  lang,
  onNavigate,
  onSelectProperty,
  savedPropertyIds = [],
  onToggleSave,
}) => {
  const [selectedHubId, setSelectedHubId] = useState<string>('coimbatore');
  const [activePopupProperty, setActivePopupProperty] = useState<MapMarkerItem | null>(null);

  // Fetch real map markers from API
  const { data: apiMarkers = [] } = useMapMarkers();

  // Combine or filter markers: only markers with valid lat & lng, with properties prop fallback
  const validMarkers = useMemo(() => {
    if (apiMarkers && apiMarkers.length > 0) {
      return apiMarkers.filter(
        (m) => typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng)
      );
    }
    // Fallback to properties prop if apiMarkers is not yet loaded
    return properties
      .filter((p) => {
        const lat = p.coordinates?.lat || p.mapCoordinates?.lat;
        const lng = p.coordinates?.lng || p.mapCoordinates?.lng;
        return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
      })
      .map((p) => {
        const lat = (p.coordinates?.lat || p.mapCoordinates?.lat)!;
        const lng = (p.coordinates?.lng || p.mapCoordinates?.lng)!;
        return {
          id: p.id,
          slug: p.slug || p.id,
          title: p.title,
          tamilTitle: (p as any).tamilTitle,
          category: p.category,
          listingType: p.listingType,
          price: p.price,
          priceUnit: p.priceUnit || 'Total Price',
          locality: p.locality || p.location,
          district: p.district,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
          lat,
          lng,
          verified: Boolean(p.verified || (p as any).verificationStatus === 'verified'),
        } as MapMarkerItem;
      });
  }, [apiMarkers, properties]);

  // Map and layer references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const regionalLayerRef = useRef<L.LayerGroup | null>(null);
  const propertyLayerRef = useRef<L.LayerGroup | null>(null);

  // Selected Hub Config
  const selectedHub = useMemo(() => {
    return REGIONAL_HUBS.find((h) => h.id === selectedHubId) || REGIONAL_HUBS[0];
  }, [selectedHubId]);

  // Aggregate stats per hub from properties array
  const hubStats = useMemo(() => {
    const stats: Record<string, { total: number; verified: number; properties: Property[] }> = {};
    REGIONAL_HUBS.forEach((hub) => {
      const matched = properties.filter((p) => hub.matches(p.district, p.location || (p as any).locality));
      const verifiedCount = matched.filter((p) => p.verified || (p as any).verificationStatus === 'verified').length;
      stats[hub.id] = {
        total: matched.length,
        verified: verifiedCount,
        properties: matched,
      };
    });
    return stats;
  }, [properties]);

  const currentHubStats = hubStats[selectedHubId] || { total: 0, verified: 0, properties: [] };
  const currentHubProperties = currentHubStats.properties;

  // Build Supercluster instance for property pins
  const clusterIndex = useMemo(() => {
    const points: any[] = validMarkers.map((m) => ({
      type: 'Feature',
      properties: { ...m },
      geometry: {
        type: 'Point',
        coordinates: [m.lng, m.lat],
      },
    }));

    const sc = new Supercluster({
      radius: 45,
      maxZoom: 16,
      minPoints: 2,
    });
    sc.load(points);
    return sc;
  }, [validMarkers]);

  // Render regional hub markers
  const renderRegionalMarkers = useCallback(() => {
    if (!regionalLayerRef.current) return;
    regionalLayerRef.current.clearLayers();

    const zoom = mapInstanceRef.current ? mapInstanceRef.current.getZoom() : 7;
    const isZoomedIn = zoom >= 11;

    REGIONAL_HUBS.forEach((hub) => {
      const stats = hubStats[hub.id] || { total: 0, verified: 0 };
      const isSelected = hub.id === selectedHubId;

      // When deeply zoomed into a corridor, show a compact hub beacon
      const html = isZoomedIn
        ? `
        <div class="gg-hub-marker-compact" style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 9999px;
          background: rgba(1, 62, 24, 0.85);
          color: #FAF8F2;
          border: 1px solid #C99325;
          font-family: inherit;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.02em;
          white-space: nowrap;
          cursor: pointer;
          backdrop-filter: blur(4px);
        ">
          <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #C99325;"></span>
          <span>${lang === 'ta' ? hub.tamilName : hub.name} Hub</span>
        </div>
        `
        : `
        <div class="gg-hub-marker" style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: ${isSelected ? '#C99325' : '#013E18'};
          color: ${isSelected ? '#00280F' : '#FFFFFF'};
          border: 2px solid ${isSelected ? '#FFFFFF' : '#C99325'};
          box-shadow: 0 4px 14px rgba(0, 40, 15, ${isSelected ? '0.6' : '0.4'});
          font-family: inherit;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.02em;
          white-space: nowrap;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isSelected ? '#00280F' : '#C99325'};"></span>
          <span>${lang === 'ta' ? hub.tamilName : hub.name}</span>
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 1px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 900;
            background: ${isSelected ? '#00280F' : 'rgba(255, 255, 255, 0.22)'};
            color: ${isSelected ? '#C99325' : '#FFFFFF'};
          ">${stats.total}</span>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'custom-hub-icon',
        iconSize: isZoomedIn ? [90, 20] : [120, 28],
        iconAnchor: isZoomedIn ? [45, 10] : [60, 14],
      });

      const marker = L.marker(hub.center, { icon, zIndexOffset: isSelected ? 100 : 50 });
      marker.on('click', () => {
        handleSelectHub(hub.id);
      });

      marker.addTo(regionalLayerRef.current!);
    });
  }, [hubStats, selectedHubId, lang]);

  // Render clustered and individual property pins
  const renderPropertyPins = useCallback(() => {
    if (!mapInstanceRef.current || !propertyLayerRef.current) return;
    propertyLayerRef.current.clearLayers();

    const map = mapInstanceRef.current;
    const zoom = Math.floor(map.getZoom());

    // When at state-wide bird's-eye view (zoom < 9), regional hub badges are the primary landmarks.
    // Reveal property clusters & price pins once zoomed into corridors (zoom >= 9).
    if (zoom < 9) {
      return;
    }

    const bounds = map.getBounds();
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

        const clusterHtml = `
          <div style="
            background: linear-gradient(135deg, #013E18 0%, #00280F 100%);
            color: #F5F2E9;
            border: 2.5px solid #C99325;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(1, 62, 24, 0.45);
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${count}
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: 'custom-cluster-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const clusterMarker = L.marker([lat, lng], { icon: clusterIcon });
        clusterMarker.on('click', () => {
          const expansionZoom = Math.min(clusterIndex.getClusterExpansionZoom(clusterId), 18);
          map.setView([lat, lng], expansionZoom, { animate: true });
        });
        clusterMarker.addTo(propertyLayerRef.current!);
      } else {
        const prop: MapMarkerItem = feat.properties;
        const priceText = formatPriceBadge(prop.price);

        const pinHtml = `
          <div style="position: relative; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));">
            <div style="
              background-color: #013E18;
              color: #FFFFFF;
              border: 1.5px solid #C99325;
              padding: 3px 8px;
              border-radius: 16px;
              font-weight: 800;
              font-size: 11px;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              ${prop.verified ? '<span style="color: #C99325; font-size: 10px;">★</span>' : ''}
              <span>${priceText}</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid #013E18;
              margin: -1px auto 0 auto;
            "></div>
          </div>
        `;

        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'custom-property-pin',
          iconSize: [54, 26],
          iconAnchor: [27, 26],
        });

        const marker = L.marker([lat, lng], { icon: pinIcon, zIndexOffset: 200 });

        // Bind interactive popup
        const safeTitle = (prop.title || '').replace(/"/g, '&quot;');
        const safeLoc = (prop.locality || prop.district || '').replace(/"/g, '&quot;');
        const safeImg = resolveImageUrl(prop.image);
        const formattedPrice = formatPriceINR(prop.price, prop.listingType);

        const popupContent = `
          <div style="font-family: inherit; width: 200px; padding: 2px;">
            <div style="width: 100%; height: 95px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; position: relative;">
              <img src="${safeImg}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover;" />
              ${prop.verified ? '<span style="position: absolute; top: 4px; right: 4px; background: rgba(1, 62, 24, 0.9); color: #C99325; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 10px;">VERIFIED</span>' : ''}
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #C99325; text-transform: uppercase;">${(prop.category || '').replace('-', ' ')}</div>
            <div style="font-size: 12px; font-weight: 800; color: #18241B; line-height: 1.2; margin: 2px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeTitle}</div>
            <div style="font-size: 10px; color: #666; margin-bottom: 4px; display: flex; align-items: center; gap: 2px;">
              📍 <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeLoc}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 6px; margin-top: 4px;">
              <span style="font-size: 12px; font-weight: 900; color: #013E18;">${formattedPrice}</span>
              <button id="view-prop-btn-${prop.id}" style="
                background: #013E18;
                color: #FAF8F2;
                border: none;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                cursor: pointer;
              ">View</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          maxWidth: 220,
          className: 'gg-property-popup',
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-prop-btn-${prop.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              onSelectProperty(prop.id);
            };
          }
        });

        marker.addTo(propertyLayerRef.current!);
      }
    });
  }, [clusterIndex, lang, onSelectProperty]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: TN_CENTER,
      zoom: TN_DEFAULT_ZOOM,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      scrollWheelZoom: false, // Prevent page scrolling hijacking
      attributionControl: true,
    });

    // Zoom controls in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // High resolution Geoapify osm-bright tiles
    const tileUrl = getGeoapifyTileUrl('osm-bright');
    const tileLayer = L.tileLayer(tileUrl || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: GEOAPIFY_ATTRIBUTION,
    });

    // Tile error fallback
    tileLayer.on('tileerror', (e) => {
      const tileImg = e.tile as HTMLImageElement;
      if (tileImg && !tileImg.dataset.fallbackTried) {
        tileImg.dataset.fallbackTried = 'true';
        const coords = (e as any).coords;
        if (coords) {
          tileImg.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
        }
      }
    });

    tileLayer.addTo(map);

    // Layer groups for markers
    regionalLayerRef.current = L.layerGroup().addTo(map);
    propertyLayerRef.current = L.layerGroup().addTo(map);

    map.fitBounds(TN_BOUNDS, { padding: [20, 20], animate: false });

    // Map listeners for re-clustering on pan/zoom
    map.on('moveend', () => {
      renderPropertyPins();
      renderRegionalMarkers();
    });

    mapInstanceRef.current = map;

    // Invalidate size once rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      regionalLayerRef.current = null;
      propertyLayerRef.current = null;
    };
  }, []);

  // Update regional markers whenever stats or selected hub changes
  useEffect(() => {
    renderRegionalMarkers();
  }, [renderRegionalMarkers]);

  // Update property clusters whenever validMarkers or clusterIndex changes
  useEffect(() => {
    renderPropertyPins();
  }, [renderPropertyPins]);

  // Handle Hub selection (from marker, chip, or button)
  const handleSelectHub = useCallback(
    (hubId: string) => {
      setSelectedHubId(hubId);
      const targetHub = REGIONAL_HUBS.find((h) => h.id === hubId);
      if (targetHub && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(targetHub.center, targetHub.zoom, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    },
    []
  );

  // Reset to bird's-eye view of Tamil Nadu
  const handleResetToTamilNadu = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(TN_BOUNDS, {
        padding: [20, 20],
        animate: true,
      });
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-stone-200/90 shadow-xl overflow-hidden">
      {/* ─── SECTION HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99325] uppercase tracking-wider mb-1.5">
            <NavigationIcon sx={{ fontSize: 14 }} />
            <span>{lang === 'ta' ? 'ஊடாடும் வரைபட வழிகாட்டி' : 'Interactive Regional Discovery'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight">
            {lang === 'ta' ? 'தமிழ்நாடு மாவட்ட வாரியான தேடல்' : 'Explore Tamil Nadu Real Estate Corridors'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            {lang === 'ta'
              ? 'வரைபடத்தில் உள்ள முக்கிய வளர்ச்சி மையங்களைத் தேர்வு செய்து அந்தந்த பகுதிகளில் உள்ள நேரடி மனை மற்றும் வீடுகளைக் கண்டறியுங்கள்.'
              : 'Select any regional hub or zoom in on the interactive map to preview verified properties in that high-growth corridor.'}
          </p>
        </div>

        {/* Selected Hub Summary Pill */}
        <div className="flex items-center gap-2 bg-[#FAF8F2] px-4 py-2 rounded-2xl border border-stone-200/80 self-start md:self-auto shrink-0 shadow-2xs">
          <LocationOnIcon sx={{ fontSize: 18, color: '#C99325' }} />
          <span className="text-xs font-bold text-[#18241B]">
            {lang === 'ta' ? selectedHub.tamilName : selectedHub.name} (
            {currentHubStats.total} {lang === 'ta' ? 'சொத்துக்கள்' : 'Properties'})
          </span>
        </div>
      </div>

      {/* ─── 10 REGIONAL HUBS HORIZONTAL SCROLL CHIPS ─── */}
      <div className="pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
          {REGIONAL_HUBS.map((hub) => {
            const isSelected = selectedHubId === hub.id;
            const count = hubStats[hub.id]?.total || 0;

            return (
              <button
                key={hub.id}
                onClick={() => handleSelectHub(hub.id)}
                className={`group px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#013E18] text-[#F5F2E9] border-[#013E18] shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-[#FAF8F2] hover:text-[#013E18] border-stone-200'
                }`}
              >
                <span>{lang === 'ta' ? hub.tamilName : hub.name}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-[#C99325] text-[#00280F]'
                      : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── MAIN MAP + PREVIEW PANEL (Desktop 7:5 Split) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-stretch">
        
        {/* Left Map View (7 cols) */}
        <div className="lg:col-span-7 relative bg-[#FAF8F2] rounded-3xl border border-stone-200 overflow-hidden shadow-inner flex flex-col h-[400px] sm:h-[460px] lg:h-[520px]">
          
          {/* Floating Controls Overlay */}
          <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
            <button
              onClick={handleResetToTamilNadu}
              title="Reset view to whole Tamil Nadu state"
              className="bg-white/95 hover:bg-white text-[#013E18] hover:text-[#C99325] border border-stone-200 shadow-md backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RestartAltIcon sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">
                {lang === 'ta' ? 'தமிழ்நாடு முழுப் பார்வை' : 'Reset to Tamil Nadu'}
              </span>
            </button>
          </div>

          {/* Map Subtitle Legend in Bottom Left */}
          <div className="absolute bottom-6 left-3 z-[1000] pointer-events-none hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] text-stone-600 shadow-sm">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#013E18] border border-[#C99325]"></span>
              <span>Regional Hub</span>
            </span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1">
              <span className="text-[#C99325] font-bold">★</span>
              <span>Verified Pins</span>
            </span>
          </div>

          {/* Leaflet Map DOM Container */}
          <div ref={mapContainerRef} className="w-full h-full relative z-0" />
        </div>

        {/* Right District Properties Preview Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#FAF8F2] rounded-3xl p-5 border border-stone-200 shadow-sm h-auto lg:h-[520px]">
          
          <div className="flex flex-col flex-1 min-h-0">
            {/* Regional Photography & Highlights Banner */}
            <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden mb-3.5 border border-stone-200/90 shadow-sm shrink-0 group">
              <img
                src={selectedHub.imageUrl}
                alt={selectedHub.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001d0b]/95 via-[#001d0b]/45 to-transparent" />
              
              {/* Verified Count Pill */}
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#e0aa3e] text-[10px] font-bold border border-white/15 flex items-center gap-1">
                <VerifiedIcon sx={{ fontSize: 13, color: '#C99325' }} />
                <span>
                  {currentHubStats.verified} {lang === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
                </span>
              </div>

              {/* Title & Description */}
              <div className="absolute bottom-2.5 left-3.5 right-3.5 text-white">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#C99325]">
                  {selectedHub.tamilName}
                </div>
                <h4 className="text-base sm:text-lg font-extrabold leading-tight">
                  {selectedHub.name} Corridor
                </h4>
                <p className="text-[11px] text-stone-200 line-clamp-1 mt-0.5">
                  {lang === 'ta' ? selectedHub.tamilDescription : selectedHub.description}
                </p>
              </div>
            </div>

            {/* Header: Section Title + View All Link */}
            <div className="flex items-center justify-between mb-2.5 shrink-0">
              <div className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                {lang === 'ta'
                  ? `${selectedHub.name} பகுதியில் உள்ள முதன்மை மனைகள்`
                  : `Top Highlights in ${selectedHub.name}`}
              </div>

              <button
                onClick={() => onNavigate('properties', { district: selectedHub.filterDistrict })}
                className="text-xs font-bold text-[#013E18] hover:text-[#C99325] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All ({currentHubStats.total})</span>
                <ArrowForwardIcon sx={{ fontSize: 13 }} />
              </button>
            </div>

            {/* List of 2-3 Real Properties in this Corridor */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[220px] lg:max-h-none">
              {currentHubProperties.slice(0, 3).map((property) => {
                const isSaved = savedPropertyIds.includes(property.id);
                const propertyImg = resolveImageUrl(property.images?.[0]);

                return (
                  <div
                    key={property.id}
                    onClick={() => onSelectProperty(property.id)}
                    className="group p-2.5 rounded-2xl border border-stone-200/90 bg-white hover:border-[#013E18]/50 hover:shadow-md transition-all cursor-pointer flex gap-3 relative"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={propertyImg}
                        alt={property.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {property.verified && (
                        <div className="absolute bottom-1 left-1 bg-[#013E18]/90 text-[#C99325] text-[9px] font-black px-1 rounded">
                          ★
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#C99325] truncate">
                            {(property.category || '').replace('-', ' ')}
                          </span>
                          {onToggleSave && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSave(property.id);
                              }}
                              className="text-stone-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                              title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                            >
                              {isSaved ? (
                                <FavoriteIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                              ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 15 }} />
                              )}
                            </button>
                          )}
                        </div>

                        <h5 className="text-xs font-bold text-[#18241B] line-clamp-1 group-hover:text-[#013E18] transition-colors">
                          {property.title}
                        </h5>

                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1 truncate">
                          <LocationOnIcon sx={{ fontSize: 13, color: '#C99325', flexShrink: 0 }} />
                          <span className="truncate">{property.location}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 mt-1">
                        <span className="text-xs font-black text-[#013E18]">
                          {formatPriceINR(property.price, property.listingType)}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500">
                          {property.plotArea} {property.plotAreaUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State when no properties in corridor */}
              {currentHubStats.total === 0 && (
                <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-stone-300 flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F2] flex items-center justify-center text-[#C99325]">
                    <ExploreIcon sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-700">
                      {lang === 'ta'
                        ? 'இப்பகுதியில் சொத்துக்கள் எதுவும் இல்லை.'
                        : 'No properties available in this area yet.'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {lang === 'ta'
                        ? 'புதிய மனைப்பிரிவுகள் விரைவில் சேர்க்கப்படும் அல்லது உங்கள் சொத்தை இங்கு பட்டியலிடுங்கள்.'
                        : 'Be the first to list a property in this corridor or browse other hubs.'}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('properties')}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {lang === 'ta' ? 'அனைத்து சொத்துக்களையும் காண்க' : 'Explore All'}
                    </button>
                    <button
                      onClick={() => onNavigate('post-property')}
                      className="px-3 py-1.5 rounded-lg bg-[#013E18] text-[#FAF8F2] hover:bg-[#00280f] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <AddCircleIcon sx={{ fontSize: 14 }} />
                      <span>{lang === 'ta' ? 'சொத்து சேர்க்க' : 'Post Property'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Direct District Filter CTA */}
          <button
            onClick={() => onNavigate('properties', { district: selectedHub.filterDistrict })}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <span>
              {lang === 'ta'
                ? `${selectedHub.name} பகுதியில் உள்ள ${currentHubStats.total} சொத்துக்களையும் காண்க`
                : `Explore All ${currentHubStats.total} Properties in ${selectedHub.name}`}
            </span>
            <ArrowForwardIcon sx={{ fontSize: 16, color: '#C99325' }} />
          </button>
        </div>

      </div>
    </div>
  );
};
