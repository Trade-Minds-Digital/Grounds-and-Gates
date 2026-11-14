import React, { useState } from 'react';
import { LOCATIONS_DATA } from '../../data/locations';
import { Property, LanguageCode } from '../../types/property';
import { formatPriceINR } from '../../utils/propertyUtils';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationIcon from '@mui/icons-material/Navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface InteractiveDiscoveryMapProps {
  properties: Property[];
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onSelectProperty: (id: string) => void;
}

// Relative SVG Coordinates (X, Y percentage coordinates inside the Tamil Nadu map viewBox 0 0 600 680)
const DISTRICT_COORDINATES: Record<string, { x: number; y: number; labelPos: 'top' | 'bottom' | 'left' | 'right' }> = {
  'Coimbatore': { x: 195, y: 390, labelPos: 'left' },
  'Chennai': { x: 470, y: 130, labelPos: 'right' },
  'Madurai': { x: 290, y: 520, labelPos: 'bottom' },
  'Tiruppur': { x: 245, y: 375, labelPos: 'top' },
  'Erode': { x: 265, y: 330, labelPos: 'top' },
  'Salem': { x: 310, y: 285, labelPos: 'top' },
  'Trichy': { x: 350, y: 410, labelPos: 'right' },
  'Pollachi': { x: 185, y: 440, labelPos: 'left' },
  'Ooty / Nilgiris': { x: 160, y: 330, labelPos: 'left' },
  'Hosur': { x: 275, y: 155, labelPos: 'top' },
};

const matchDistrictProperties = (props: Property[], distName: string): Property[] => {
  const norm = (s: string) => (s || '').toLowerCase().trim();
  const target = norm(distName);
  return props.filter(p => {
    const pDist = norm(p.district);
    const pLoc = norm(p.location);
    if (target.includes('ooty') || target.includes('nilgiris')) {
      return pDist.includes('ooty') || pDist.includes('nilgiris') || pLoc.includes('ooty') || pLoc.includes('nilgiris');
    }
    if (target.includes('pollachi')) {
      return pDist.includes('pollachi') || pLoc.includes('pollachi');
    }
    if (target === 'coimbatore') {
      return pDist === 'coimbatore' && !pLoc.includes('pollachi');
    }
    return pDist === target;
  });
};

export const InteractiveDiscoveryMap: React.FC<InteractiveDiscoveryMapProps> = ({
  properties,
  lang,
  onNavigate,
  onSelectProperty
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Coimbatore');

  // Filter properties matching selected district
  const districtProperties = matchDistrictProperties(properties, selectedDistrict);
  const selectedLocationMeta = LOCATIONS_DATA.find(l => l.name === selectedDistrict);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xl overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-stone-100">
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
              ? 'வரைபடத்தில் உள்ள இடங்களைத் தேர்வு செய்து அந்தந்த பகுதிகளில் உள்ள நேரடி மனை மற்றும் வீடுகளைக் கண்டறியுங்கள்.'
              : 'Select any regional hub on the interactive map to preview verified properties in that growth corridor.'}
          </p>
        </div>

        {/* Selected Hub Summary Pill */}
        <div className="flex items-center gap-2 bg-[#F5F2E9] px-4 py-2 rounded-2xl border border-stone-200/80">
          <LocationOnIcon sx={{ fontSize: 18, color: '#C99325' }} />
          <span className="text-xs font-bold text-[#18241B]">
            {selectedDistrict} ({districtProperties.length} {lang === 'ta' ? 'சொத்துக்கள்' : 'Properties'})
          </span>
        </div>
      </div>

      {/* Main Map + Card Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
        
        {/* Left Interactive SVG Map (7 cols) */}
        <div className="lg:col-span-7 relative bg-[#FAF8F2] rounded-3xl p-6 border border-stone-200/60 overflow-hidden flex flex-col items-center justify-center min-h-[440px]">
          {/* Map Subtitle & Legend */}
          <div className="w-full flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-stone-400">
              Tamil Nadu State Geographic Grid
            </span>
            <span className="text-[11px] font-bold text-[#013E18] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C99325] animate-ping" />
              10 Regional Hubs
            </span>
          </div>

          {/* SVG Map of Tamil Nadu with Interactive District Pins */}
          <div className="relative w-full max-w-[480px] aspect-[600/680]">
            <svg
              viewBox="0 0 600 680"
              className="w-full h-full drop-shadow-sm select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="tn-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ede7dc" />
                  <stop offset="100%" stopColor="#ded5c4" />
                </linearGradient>
                <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e8eff5" />
                  <stop offset="100%" stopColor="#d4e3ee" />
                </linearGradient>
              </defs>

              {/* Bay of Bengal & Indian Ocean Coastline Backdrop */}
              <rect width="600" height="680" rx="20" fill="url(#water-gradient)" opacity="0.3" />

              {/* Simplified Geometric Polygon Outline of Tamil Nadu */}
              <path
                d="M 270,120 
                   L 320,110 
                   L 440,115 
                   L 490,135 
                   L 470,220 
                   L 450,290 
                   L 460,340 
                   L 430,420 
                   L 410,480 
                   L 380,530 
                   L 340,610 
                   L 300,660 
                   L 260,650 
                   L 220,600 
                   L 225,550 
                   L 170,470 
                   L 150,420 
                   L 140,360 
                   L 180,310 
                   L 220,290 
                   L 250,210 
                   L 250,150 Z"
                fill="url(#tn-gradient)"
                stroke="#c2b8a3"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-colors duration-300"
              />

              {/* Subtle Regional Arterial Highways / Corridors */}
              <path
                d="M 195,390 L 245,375 L 265,330 L 310,285 L 470,130"
                fill="none"
                stroke="#C99325"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <path
                d="M 195,390 L 290,520 L 350,410 L 470,130"
                fill="none"
                stroke="#013E18"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />

              {/* District Interactive Pins */}
              {Object.entries(DISTRICT_COORDINATES).map(([distName, coord]) => {
                const isSelected = selectedDistrict === distName;
                const count = matchDistrictProperties(properties, distName).length;

                return (
                  <g
                    key={distName}
                    transform={`translate(${coord.x}, ${coord.y})`}
                    onClick={() => setSelectedDistrict(distName)}
                    className="cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${distName}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedDistrict(distName);
                      }
                    }}
                  >
                    {/* Pulsing ring on selected */}
                    {isSelected && (
                      <circle
                        r="18"
                        fill="#C99325"
                        opacity="0.25"
                        className="animate-ping origin-center"
                      />
                    )}

                    {/* Pin Circle */}
                    <circle
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? '#013E18' : '#FFFFFF'}
                      stroke={isSelected ? '#C99325' : '#013E18'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200 group-hover:scale-125"
                    />

                    {/* Pin Center Dot */}
                    <circle
                      r={isSelected ? 3.5 : 2.5}
                      fill={isSelected ? '#C99325' : '#013E18'}
                    />

                    {/* District Label Text */}
                    <text
                      x={coord.labelPos === 'right' ? 14 : coord.labelPos === 'left' ? -14 : 0}
                      y={coord.labelPos === 'top' ? -14 : coord.labelPos === 'bottom' ? 20 : 4}
                      textAnchor={coord.labelPos === 'right' ? 'start' : coord.labelPos === 'left' ? 'end' : 'middle'}
                      className={`text-[11px] font-bold select-none transition-all ${
                        isSelected
                          ? 'fill-[#013E18] font-black'
                          : 'fill-stone-700 group-hover:fill-[#013E18]'
                      }`}
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#FFFFFF',
                        strokeWidth: '3px',
                        strokeLinejoin: 'round'
                      }}
                    >
                      {distName} ({count})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick District Buttons Row */}
          <div className="w-full flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-stone-200/60 mt-2 pb-1">
            {Object.keys(DISTRICT_COORDINATES).map((name) => (
              <button
                key={name}
                onClick={() => setSelectedDistrict(name)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDistrict === name
                    ? 'bg-[#013E18] text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Right District Properties Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Featured Regional Hub Preview Card with Photography */}
            {selectedLocationMeta && (
              <div className="relative h-40 rounded-2xl overflow-hidden mb-4 border border-stone-200 shadow-sm group">
                <img
                  key={selectedLocationMeta.id}
                  src={selectedLocationMeta.imageUrl}
                  alt={selectedLocationMeta.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001d0b]/90 via-[#001d0b]/35 to-transparent" />
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-[#e0aa3e] text-[10px] font-bold border border-white/15">
                  {districtProperties.length} Verified Listings
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#C99325]">
                    {selectedLocationMeta.tamilName}
                  </div>
                  <h4 className="text-lg font-extrabold leading-tight">
                    {selectedDistrict} Corridor
                  </h4>
                  <p className="text-[11px] text-stone-200 line-clamp-1 mt-0.5">
                    {selectedLocationMeta.description}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Top Highlights in {selectedDistrict}
              </div>

              <button
                onClick={() => onNavigate('properties', { district: selectedDistrict })}
                className="text-xs font-bold text-[#013E18] hover:text-[#C99325] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({districtProperties.length})</span>
                <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </button>
            </div>

            {/* List of 2 Top Properties in this District */}
            <div className="space-y-3">
              {districtProperties.slice(0, 2).map((property) => (
                <div
                  key={property.id}
                  onClick={() => onSelectProperty(property.id)}
                  className="group p-3 rounded-2xl border border-stone-200/80 bg-white hover:border-[#013E18]/40 hover:shadow-md transition-all cursor-pointer flex gap-3.5"
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-102 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C99325]">
                        {property.category.replace('-', ' ')}
                      </span>
                      <h5 className="text-xs font-bold text-[#18241B] line-clamp-1 group-hover:text-[#013E18] transition-colors">
                        {property.title}
                      </h5>
                      <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <LocationOnIcon sx={{ fontSize: 14, color: '#C99325', flexShrink: 0 }} />
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
              ))}

              {districtProperties.length === 0 && (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
                  No sample properties registered in this district currently.
                </div>
              )}
            </div>
          </div>

          {/* Direct District Filter CTA */}
          <button
            onClick={() => onNavigate('properties', { district: selectedDistrict })}
            className="w-full py-3 px-4 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Explore All {districtProperties.length} Properties in {selectedDistrict}</span>
            <ArrowForwardIcon sx={{ fontSize: 16, color: '#C99325' }} />
          </button>
        </div>

      </div>
    </div>
  );
};
