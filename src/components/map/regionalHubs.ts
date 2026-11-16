export interface RegionalHubConfig {
  id: string;
  name: string;
  tamilName: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  filterDistrict: string;
  popularLocalities: string[];
  imageUrl: string;
  description: string;
  tamilDescription: string;
  matches: (district: string, locality?: string) => boolean;
}

// Helper to format concise map price badges (e.g. ₹38.5L, ₹1.4Cr)
export function formatPriceBadge(price: number): string {
  if (price >= 10000000) {
    const val = (price / 10000000).toFixed(1);
    return `₹${val.endsWith('.0') ? val.slice(0, -2) : val}Cr`;
  }
  if (price >= 100000) {
    const val = (price / 100000).toFixed(1);
    return `₹${val.endsWith('.0') ? val.slice(0, -2) : val}L`;
  }
  return `₹${(price / 1000).toFixed(0)}K`;
}

// 10 Regional Corridors of Tamil Nadu
export const REGIONAL_HUBS: RegionalHubConfig[] = [
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    tamilName: 'கோயம்புத்தூர்',
    center: [11.0168, 76.9558],
    zoom: 11,
    filterDistrict: 'Coimbatore',
    popularLocalities: ['Saravanampatti', 'Vadavalli', 'Kalapatti', 'Peelamedu', 'Gandhipuram', 'Avinashi Road'],
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    description: 'The Manchester of South India - premier education and textile & IT hub with consistent land appreciation.',
    tamilDescription: 'தென்னிந்தியாவின் மான்செஸ்டர் - கல்வி, தொழில் & தகவல் தொழில்நுட்ப வளர்ச்சி மையம்.',
    matches: (d, l) => {
      const dist = (d || '').toLowerCase().trim();
      const loc = (l || '').toLowerCase().trim();
      return dist === 'coimbatore' && !loc.includes('pollachi');
    },
  },
  {
    id: 'chennai',
    name: 'Chennai',
    tamilName: 'சென்னை',
    center: [13.0827, 80.2707],
    zoom: 11,
    filterDistrict: 'Chennai',
    popularLocalities: ['OMR', 'Sholinganallur', 'ECR', 'Tambaram', 'Anna Nagar', 'Perungudi'],
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    description: 'Capital city with booming IT expressway corridors, coastal villas, and high rental yields.',
    tamilDescription: 'தலைநகர் சென்னை - விரைவுச்சாலை, தகவல் தொழில்நுட்ப மையங்கள் மற்றும் கடற்கரை இல்லங்கள்.',
    matches: (d) => (d || '').toLowerCase().trim() === 'chennai',
  },
  {
    id: 'madurai',
    name: 'Madurai',
    tamilName: 'மதுரை',
    center: [9.9252, 78.1198],
    zoom: 12,
    filterDistrict: 'Madurai',
    popularLocalities: ['KK Nagar', 'Othakadai', 'Thirunagar', 'Mattuthavani', 'Ellis Nagar'],
    imageUrl: 'https://images.unsplash.com/photo-1609137144822-26f63435fa89?auto=format&fit=crop&w=800&q=80',
    description: 'Cultural capital with expanding industrial ring roads and airport corridor investments.',
    tamilDescription: 'கலாச்சார தலைநகர் - விரிவடையும் வளைய சாலை மற்றும் விமான நிலைய வளர்ச்சி மண்டலம்.',
    matches: (d) => (d || '').toLowerCase().trim() === 'madurai',
  },
  {
    id: 'tiruppur',
    name: 'Tiruppur',
    tamilName: 'திருப்பூர்',
    center: [11.1085, 77.3411],
    zoom: 12,
    filterDistrict: 'Tiruppur',
    popularLocalities: ['Avinashi', 'Palladam Road', 'Dharapuram Road', 'Kangeyam Road'],
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'India’s knitwear textile powerhouse with vibrant commercial and residential plot demand.',
    tamilDescription: 'பின்னலாடை நகரம் - சுறுசுறுப்பான வணிக மற்றும் குடியிருப்பு மனை தேவை.',
    matches: (d) => (d || '').toLowerCase().trim() === 'tiruppur',
  },
  {
    id: 'erode',
    name: 'Erode',
    tamilName: 'ஈரோடு',
    center: [11.3410, 77.7172],
    zoom: 12,
    filterDistrict: 'Erode',
    popularLocalities: ['Perundurai', 'Thindal', 'Bhavani Road', 'Modakkurichi'],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    description: 'Agricultural & industrial hub with serene river basin farmland and gated plots.',
    tamilDescription: 'காவிரி நதிக்கரை வேளாண் மற்றும் தொழில்துறை வளர்ச்சி மனைப்பிரிவுகள்.',
    matches: (d) => (d || '').toLowerCase().trim() === 'erode',
  },
  {
    id: 'salem',
    name: 'Salem',
    tamilName: 'சேலம்',
    center: [11.6643, 78.1460],
    zoom: 12,
    filterDistrict: 'Salem',
    popularLocalities: ['Fairlands', 'Hasthampatti', 'Ammapet', 'Yercaud Foothills'],
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'Strategic junction connecting South India with lush hill-view residential avenues.',
    tamilDescription: 'தென்னிந்தியாவின் போக்குவரத்து சந்திப்பு மற்றும் மலைசார் அழகிய குடியிருப்புகள்.',
    matches: (d) => (d || '').toLowerCase().trim() === 'salem',
  },
  {
    id: 'trichy',
    name: 'Trichy',
    tamilName: 'திருச்சிராப்பள்ளி',
    center: [10.7905, 78.7047],
    zoom: 12,
    filterDistrict: 'Tiruchirappalli',
    popularLocalities: ['Thillai Nagar', 'KK Nagar', 'Srirangam', 'Airport Road'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Centrally located educational center and international transit corridor.',
    tamilDescription: 'மைய தமிழகத்தின் முன்னணி கல்வி மையம் மற்றும் போக்குவரத்து மண்டலம்.',
    matches: (d) => {
      const dist = (d || '').toLowerCase().trim();
      return dist === 'trichy' || dist === 'tiruchirappalli';
    },
  },
  {
    id: 'pollachi',
    name: 'Pollachi',
    tamilName: 'பொள்ளாச்சி',
    center: [10.6586, 77.0090],
    zoom: 12,
    filterDistrict: 'Coimbatore',
    popularLocalities: ['Mahalingapuram', 'Udumalpet Road', 'Anaimalai', 'Kinathukadavu'],
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    description: 'Coconut capital offering scenic farmhouses, fertile coconut groves, and tranquil living.',
    tamilDescription: 'தென்னை மர சோலைகள், பண்ணை வீடுகள் மற்றும் இயற்கையெழில் கொஞ்சும் பகுதிகள்.',
    matches: (d, l) => {
      const dist = (d || '').toLowerCase().trim();
      const loc = (l || '').toLowerCase().trim();
      return dist.includes('pollachi') || loc.includes('pollachi');
    },
  },
  {
    id: 'ooty',
    name: 'Ooty / Nilgiris',
    tamilName: 'ஊட்டி / நீலகிரி',
    center: [11.4102, 76.6950],
    zoom: 12,
    filterDistrict: 'The Nilgiris',
    popularLocalities: ['Coonoor', 'Kotagiri', 'Fernhill', 'Lovedale'],
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    description: 'Queen of Hill Stations with tea estate lands, private holiday cottages, and heritage bungalows.',
    tamilDescription: 'மலைகளின் அரசி - தேயிலைத் தோட்டங்கள், குளிர்கால பண்ணை வீடுகள்.',
    matches: (d, l) => {
      const dist = (d || '').toLowerCase().trim();
      const loc = (l || '').toLowerCase().trim();
      return (
        dist === 'the nilgiris' ||
        dist.includes('nilgiris') ||
        dist.includes('ooty') ||
        loc.includes('ooty') ||
        loc.includes('coonoor') ||
        loc.includes('kotagiri')
      );
    },
  },
  {
    id: 'hosur',
    name: 'Hosur',
    tamilName: 'ஓசூர்',
    center: [12.7409, 77.8253],
    zoom: 12,
    filterDistrict: 'Krishnagiri',
    popularLocalities: ['Bagalur Road', 'Mathigiri', 'SIPCOT Industrial Area', 'Rayakottai Road'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'EV & industrial manufacturing boomtown right on the Bangalore border with immense growth.',
    tamilDescription: 'தொழில்துறை மற்றும் மின்சார வாகன உற்பத்தி மையம் - அதிவேக வளர்ச்சிப்பகுதி.',
    matches: (d, l) => {
      const dist = (d || '').toLowerCase().trim();
      const loc = (l || '').toLowerCase().trim();
      return dist === 'krishnagiri' || dist.includes('hosur') || loc.includes('hosur');
    },
  },
];
