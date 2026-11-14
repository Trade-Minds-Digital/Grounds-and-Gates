import { Project } from '../../types/demo';

export const INITIAL_DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-royal-gates-cbe',
    developerId: 'dev-gg-estates',
    name: 'The Royal Gates Enclave',
    tamilName: 'தி ராயல் கேட்ஸ் என்க்ளேவ்',
    district: 'Coimbatore',
    locality: 'Saravanampatti',
    status: 'ready-to-occupy',
    completionYear: 2025,
    reraNumber: 'TN/11/Layout/0248/2025 (Demo)',
    approvalAuthority: 'DTCP',
    totalUnits: 64,
    availableUnits: 14,
    priceRange: { min: 3850000, max: 8500000 },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A grand 24-acre DTCP and RERA approved gated residential villa township with 40ft blacktop avenues, Siruvani drinking water, solar lighting, and club facilities.'
  },
  {
    id: 'proj-avinashi-villas-cbe',
    developerId: 'dev-kovai-promoters',
    name: 'Avinashi Royal Boulevard',
    tamilName: 'அவிநாசி ராயல் பொலிவார்ட்',
    district: 'Coimbatore',
    locality: 'Peelamedu',
    status: 'ready-to-occupy',
    completionYear: 2024,
    reraNumber: 'TN/11/Building/0112/2024 (Demo)',
    approvalAuthority: 'DTCP',
    totalUnits: 28,
    availableUnits: 5,
    priceRange: { min: 28000000, max: 45000000 },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Ultra-luxury architect-designed independent smart villas with private gardens, infinity pools, and Italian marble finishes near Coimbatore International Airport.'
  },
  {
    id: 'proj-omr-silicon-chn',
    developerId: 'dev-ecr-living',
    name: 'OMR Silicon Horizon',
    tamilName: 'OMR சிலிகான் ஹொரைசன்',
    district: 'Chennai',
    locality: 'Perungudi, OMR',
    status: 'under-construction',
    completionYear: 2026,
    reraNumber: 'TN/02/Building/0541/2024 (Demo)',
    approvalAuthority: 'CMDA',
    totalUnits: 120,
    availableUnits: 32,
    priceRange: { min: 14500000, max: 22000000 },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'High-rise CMDA registered premium apartments directly opposite major tech SEZs with panoramic sea and marshland views.'
  },
  {
    id: 'proj-pollachi-canopy',
    developerId: 'dev-gg-estates',
    name: 'Pollachi Green Canopy Farms',
    tamilName: 'பொள்ளாச்சி கிரீன் கேனபி பண்ணைகள்',
    district: 'Coimbatore',
    locality: 'Pollachi',
    status: 'ready-to-occupy',
    completionYear: 2023,
    reraNumber: 'TN/11/Agri/0087/2023 (Demo)',
    approvalAuthority: 'DTCP',
    totalUnits: 18,
    availableUnits: 4,
    priceRange: { min: 8500000, max: 19500000 },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Yield-generating coconut groves with perennial canal water, drip irrigation system, and farmhouse entitlements.'
  },
  {
    id: 'proj-nilgiris-tea-estates',
    developerId: 'dev-nilgiris-heritage',
    name: 'Nilgiris Mist Tea Estates',
    tamilName: 'நீலகிரி மிஸ்ட் தேயிலை எஸ்டேட்ஸ்',
    district: 'The Nilgiris',
    locality: 'Coonoor',
    status: 'ready-to-occupy',
    completionYear: 2023,
    reraNumber: 'TN/01/Layout/0019/2023 (Demo)',
    approvalAuthority: 'DTCP',
    totalUnits: 10,
    availableUnits: 2,
    priceRange: { min: 34000000, max: 62000000 },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Exclusive British colonial-style tea estate bungalows surrounded by rolling organic tea plantations with mountain sunrise views.'
  }
];
