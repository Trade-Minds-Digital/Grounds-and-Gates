import { MasterItem } from '../models/MasterItem.js';
import { WebContent } from '../models/WebContent.js';
import { Property } from '../models/Property.js';
import { Lead } from '../models/Lead.js';
import { Booking } from '../models/Booking.js';
export const seedMastersAndContent = async () => {
    console.log('🌱 Checking and seeding Centralized Masters & Web Content...');
    const mastersData = [
        // ==========================================
        // 1. LOCATION MASTERS
        // ==========================================
        {
            type: 'country',
            group: 'location',
            code: 'in',
            name: 'India',
            nameTa: 'இந்தியா',
            description: 'Republic of India',
            displayOrder: 1,
            isActive: true,
            isSystem: true,
        },
        {
            type: 'state',
            group: 'location',
            code: 'tn',
            name: 'Tamil Nadu',
            nameTa: 'தமிழ்நாடு',
            parentCode: 'in',
            description: 'State of Tamil Nadu',
            displayOrder: 1,
            isActive: true,
            isSystem: true,
        },
        // Districts (Key Tamil Nadu Growth Hubs)
        { type: 'district', group: 'location', code: 'coimbatore', name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', parentCode: 'tn', displayOrder: 1, isSystem: true, metadata: { hubCode: 'cbe', isMetro: true } },
        { type: 'district', group: 'location', code: 'chennai', name: 'Chennai', nameTa: 'சென்னை', parentCode: 'tn', displayOrder: 2, isSystem: true, metadata: { hubCode: 'chn', isMetro: true } },
        { type: 'district', group: 'location', code: 'madurai', name: 'Madurai', nameTa: 'மதுரை', parentCode: 'tn', displayOrder: 3, isSystem: true, metadata: { hubCode: 'mdu' } },
        { type: 'district', group: 'location', code: 'tiruppur', name: 'Tiruppur', nameTa: 'திருப்பூர்', parentCode: 'tn', displayOrder: 4, isSystem: true, metadata: { hubCode: 'tpr' } },
        { type: 'district', group: 'location', code: 'erode', name: 'Erode', nameTa: 'ஈரோடு', parentCode: 'tn', displayOrder: 5, isSystem: true, metadata: { hubCode: 'erd' } },
        { type: 'district', group: 'location', code: 'salem', name: 'Salem', nameTa: 'சேலம்', parentCode: 'tn', displayOrder: 6, isSystem: true, metadata: { hubCode: 'slm' } },
        { type: 'district', group: 'location', code: 'trichy', name: 'Trichy', nameTa: 'திருச்சிராப்பள்ளி', parentCode: 'tn', displayOrder: 7, isSystem: true, metadata: { hubCode: 'try' } },
        { type: 'district', group: 'location', code: 'nilgiris', name: 'Nilgiris', nameTa: 'நீலகிரி', parentCode: 'tn', displayOrder: 8, isSystem: true, metadata: { hubCode: 'oty' } },
        { type: 'district', group: 'location', code: 'hosur', name: 'Hosur', nameTa: 'ஓசூர்', parentCode: 'tn', displayOrder: 9, isSystem: true, metadata: { hubCode: 'hsr' } },
        { type: 'district', group: 'location', code: 'pollachi', name: 'Pollachi', nameTa: 'பொள்ளாச்சி', parentCode: 'tn', displayOrder: 10, isSystem: true, metadata: { hubCode: 'pol' } },
        // Cities / Towns
        { type: 'city', group: 'location', code: 'coimbatore-city', name: 'Coimbatore City', nameTa: 'கோயம்புத்தூர் நகரம்', parentCode: 'coimbatore', displayOrder: 1 },
        { type: 'city', group: 'location', code: 'chennai-city', name: 'Chennai City', nameTa: 'சென்னை நகரம்', parentCode: 'chennai', displayOrder: 2 },
        { type: 'city', group: 'location', code: 'madurai-city', name: 'Madurai City', nameTa: 'மதுரை நகரம்', parentCode: 'madurai', displayOrder: 3 },
        { type: 'city', group: 'location', code: 'tiruppur-city', name: 'Tiruppur City', nameTa: 'திருப்பூர் நகரம்', parentCode: 'tiruppur', displayOrder: 4 },
        { type: 'city', group: 'location', code: 'erode-city', name: 'Erode City', nameTa: 'ஈரோடு நகரம்', parentCode: 'erode', displayOrder: 5 },
        { type: 'city', group: 'location', code: 'salem-city', name: 'Salem City', nameTa: 'சேலம் நகரம்', parentCode: 'salem', displayOrder: 6 },
        { type: 'city', group: 'location', code: 'trichy-city', name: 'Trichy City', nameTa: 'திருச்சி நகரம்', parentCode: 'trichy', displayOrder: 7 },
        { type: 'city', group: 'location', code: 'ooty-town', name: 'Ooty Town', nameTa: 'ஊட்டி', parentCode: 'nilgiris', displayOrder: 8 },
        { type: 'city', group: 'location', code: 'coonoor-town', name: 'Coonoor', nameTa: 'குன்னூர்', parentCode: 'nilgiris', displayOrder: 9 },
        { type: 'city', group: 'location', code: 'kotagiri-town', name: 'Kotagiri', nameTa: 'கோத்தகிரி', parentCode: 'nilgiris', displayOrder: 10 },
        { type: 'city', group: 'location', code: 'hosur-town', name: 'Hosur Town', nameTa: 'ஓசூர் நகரம்', parentCode: 'hosur', displayOrder: 11 },
        { type: 'city', group: 'location', code: 'pollachi-town', name: 'Pollachi Town', nameTa: 'பொள்ளாச்சி நகரம்', parentCode: 'pollachi', displayOrder: 12 },
        // Localities under Coimbatore
        { type: 'locality', group: 'location', code: 'saravanampatti', name: 'Saravanampatti', nameTa: 'சரவணம்பட்டி', parentCode: 'coimbatore', displayOrder: 1, metadata: { pinCode: '641035', corridor: 'cbe-it-corridor' } },
        { type: 'locality', group: 'location', code: 'vadavalli', name: 'Vadavalli', nameTa: 'வடவள்ளி', parentCode: 'coimbatore', displayOrder: 2, metadata: { pinCode: '641041', corridor: 'marudhamalai-foothills' } },
        { type: 'locality', group: 'location', code: 'kalapatti', name: 'Kalapatti', nameTa: 'காளப்பட்டி', parentCode: 'coimbatore', displayOrder: 3, metadata: { pinCode: '641048', corridor: 'cbe-airport-corridor' } },
        { type: 'locality', group: 'location', code: 'peelamedu', name: 'Peelamedu', nameTa: 'பீளமேடு', parentCode: 'coimbatore', displayOrder: 4, metadata: { pinCode: '641004' } },
        { type: 'locality', group: 'location', code: 'gandhipuram', name: 'Gandhipuram', nameTa: 'காந்திபுரம்', parentCode: 'coimbatore', displayOrder: 5, metadata: { pinCode: '641012' } },
        { type: 'locality', group: 'location', code: 'avinashi-road', name: 'Avinashi Road', nameTa: 'அவினாசி சாலை', parentCode: 'coimbatore', displayOrder: 6, metadata: { pinCode: '641014' } },
        { type: 'locality', group: 'location', code: 'pollachi-road', name: 'Pollachi Road', nameTa: 'பொள்ளாச்சி சாலை', parentCode: 'coimbatore', displayOrder: 7, metadata: { pinCode: '641021' } },
        { type: 'locality', group: 'location', code: 'race-course', name: 'Race Course', nameTa: 'ரேஸ் கோர்ஸ்', parentCode: 'coimbatore', displayOrder: 8, metadata: { pinCode: '641018' } },
        { type: 'locality', group: 'location', code: 'kinathukadavu', name: 'Kinathukadavu', nameTa: 'கிணத்துக்கடவு', parentCode: 'coimbatore', displayOrder: 9, metadata: { pinCode: '642109' } },
        // Localities under Chennai
        { type: 'locality', group: 'location', code: 'omr', name: 'OMR (Old Mahabalipuram Rd)', nameTa: 'ஓ.எம்.ஆர்', parentCode: 'chennai', displayOrder: 1, metadata: { pinCode: '600096', corridor: 'chennai-omr-expressway' } },
        { type: 'locality', group: 'location', code: 'sholinganallur', name: 'Sholinganallur', nameTa: 'சோழிங்கநல்லூர்', parentCode: 'chennai', displayOrder: 2, metadata: { pinCode: '600119', corridor: 'chennai-omr-expressway' } },
        { type: 'locality', group: 'location', code: 'ecr', name: 'ECR (East Coast Road)', nameTa: 'ஈ.சி.ஆர்', parentCode: 'chennai', displayOrder: 3, metadata: { pinCode: '600041', corridor: 'chennai-ecr-coast' } },
        { type: 'locality', group: 'location', code: 'tambaram', name: 'Tambaram', nameTa: 'தாம்பரம்', parentCode: 'chennai', displayOrder: 4, metadata: { pinCode: '600045' } },
        { type: 'locality', group: 'location', code: 'anna-nagar', name: 'Anna Nagar', nameTa: 'அண்ணா நகர்', parentCode: 'chennai', displayOrder: 5, metadata: { pinCode: '600040' } },
        { type: 'locality', group: 'location', code: 'perungudi', name: 'Perungudi', nameTa: 'பெருங்குடி', parentCode: 'chennai', displayOrder: 6, metadata: { pinCode: '600096' } },
        { type: 'locality', group: 'location', code: 'medavakkam', name: 'Medavakkam', nameTa: 'மேடவாக்கம்', parentCode: 'chennai', displayOrder: 7, metadata: { pinCode: '600100' } },
        { type: 'locality', group: 'location', code: 'guindy', name: 'Guindy', nameTa: 'கிண்டி', parentCode: 'chennai', displayOrder: 8, metadata: { pinCode: '600032' } },
        // Localities under Madurai
        { type: 'locality', group: 'location', code: 'kk-nagar-madurai', name: 'KK Nagar', nameTa: 'கே.கே. நகர்', parentCode: 'madurai', displayOrder: 1, metadata: { pinCode: '625020' } },
        { type: 'locality', group: 'location', code: 'othakadai', name: 'Othakadai', nameTa: 'ஒத்தக்கடை', parentCode: 'madurai', displayOrder: 2, metadata: { pinCode: '625107' } },
        { type: 'locality', group: 'location', code: 'thirunagar', name: 'Thirunagar', nameTa: 'திருநகர்', parentCode: 'madurai', displayOrder: 3, metadata: { pinCode: '625006' } },
        { type: 'locality', group: 'location', code: 'mattuthavani', name: 'Mattuthavani', nameTa: 'மாட்டுத்தாவணி', parentCode: 'madurai', displayOrder: 4, metadata: { pinCode: '625007' } },
        // Localities under Tiruppur
        { type: 'locality', group: 'location', code: 'avinashi', name: 'Avinashi', nameTa: 'அவினாசி', parentCode: 'tiruppur', displayOrder: 1, metadata: { pinCode: '641654' } },
        { type: 'locality', group: 'location', code: 'palladam-road', name: 'Palladam Road', nameTa: 'பல்லடம் சாலை', parentCode: 'tiruppur', displayOrder: 2, metadata: { pinCode: '641604' } },
        // Localities under Erode
        { type: 'locality', group: 'location', code: 'perundurai', name: 'Perundurai', nameTa: 'பெருந்துறை', parentCode: 'erode', displayOrder: 1, metadata: { pinCode: '638052' } },
        { type: 'locality', group: 'location', code: 'thindal', name: 'Thindal', nameTa: 'திண்டல்', parentCode: 'erode', displayOrder: 2, metadata: { pinCode: '638012' } },
        // Localities under Salem
        { type: 'locality', group: 'location', code: 'fairlands', name: 'Fairlands', nameTa: 'ஃபேர்லேண்ட்ஸ்', parentCode: 'salem', displayOrder: 1, metadata: { pinCode: '636016' } },
        { type: 'locality', group: 'location', code: 'hasthampatti', name: 'Hasthampatti', nameTa: 'ஹஸ்தம்பட்டி', parentCode: 'salem', displayOrder: 2, metadata: { pinCode: '636007' } },
        // Localities under Trichy
        { type: 'locality', group: 'location', code: 'thillai-nagar', name: 'Thillai Nagar', nameTa: 'தில்லை நகர்', parentCode: 'trichy', displayOrder: 1, metadata: { pinCode: '620018' } },
        { type: 'locality', group: 'location', code: 'srirangam', name: 'Srirangam', nameTa: 'ஸ்ரீரங்கம்', parentCode: 'trichy', displayOrder: 2, metadata: { pinCode: '620006' } },
        // Localities under Nilgiris
        { type: 'locality', group: 'location', code: 'coonoor', name: 'Coonoor', nameTa: 'குன்னூர்', parentCode: 'nilgiris', displayOrder: 1, metadata: { pinCode: '643101' } },
        { type: 'locality', group: 'location', code: 'kotagiri', name: 'Kotagiri', nameTa: 'கோத்தகிரி', parentCode: 'nilgiris', displayOrder: 2, metadata: { pinCode: '643217' } },
        { type: 'locality', group: 'location', code: 'ooty', name: 'Ooty (Udhagai)', nameTa: 'ஊட்டி', parentCode: 'nilgiris', displayOrder: 3, metadata: { pinCode: '643001' } },
        // Localities under Hosur
        { type: 'locality', group: 'location', code: 'mathigiri', name: 'Mathigiri', nameTa: 'மதிகிரி', parentCode: 'hosur', displayOrder: 1, metadata: { pinCode: '635110' } },
        { type: 'locality', group: 'location', code: 'bagalur-road', name: 'Bagalur Road', nameTa: 'பாகலூர் சாலை', parentCode: 'hosur', displayOrder: 2, metadata: { pinCode: '635103' } },
        // Regional Growth Corridors
        { type: 'regional_hub', group: 'location', code: 'cbe-it-corridor', name: 'Coimbatore IT & Innovation Corridor', nameTa: 'கோவை ஐடி இன்னோவேஷன் காரிடார்', parentCode: 'coimbatore', displayOrder: 1 },
        { type: 'regional_hub', group: 'location', code: 'chennai-omr-expressway', name: 'Chennai OMR Cyber Expressway', nameTa: 'சென்னை ஓ.எம்.ஆர் சைபர் விரைவுச்சாலை', parentCode: 'chennai', displayOrder: 2 },
        { type: 'regional_hub', group: 'location', code: 'chennai-ecr-coast', name: 'Chennai ECR Coastal Heritage Belt', nameTa: 'சென்னை ஈ.சி.ஆர் கடற்கரை மண்டலம்', parentCode: 'chennai', displayOrder: 3 },
        { type: 'regional_hub', group: 'location', code: 'hosur-border-hub', name: 'Hosur Mega Industrial & Border Hub', nameTa: 'ஓசூர் தொழிற்பேட்டை மண்டலம்', parentCode: 'hosur', displayOrder: 4 },
        { type: 'regional_hub', group: 'location', code: 'nilgiris-heritage-belt', name: 'Nilgiris Plantation & Tourism Corridor', nameTa: 'நீலகிரி தேயிலைத் தோட்ட காரிடார்', parentCode: 'nilgiris', displayOrder: 5 },
        // ==========================================
        // 2. PROPERTY MASTERS
        // ==========================================
        // Categories (System Protected)
        {
            type: 'property_category',
            group: 'property',
            code: 'residential-plots',
            name: 'Residential Plots',
            nameTa: 'வீட்டு மனைகள்',
            description: 'DTCP & CMDA approved gated community villa plots with clear titles.',
            displayOrder: 1,
            isSystem: true,
            metadata: { typicalUnits: 'Cents / Sq.ft', icon: 'MapPin' },
        },
        {
            type: 'property_category',
            group: 'property',
            code: 'agricultural-land',
            name: 'Agricultural Land',
            nameTa: 'விவசாய நிலம்',
            description: 'Fertile farmland, coconut groves, farmhouses & agro-investment tracts.',
            displayOrder: 2,
            isSystem: true,
            metadata: { typicalUnits: 'Acres / Cents', icon: 'Tractor' },
        },
        {
            type: 'property_category',
            group: 'property',
            code: 'independent-houses',
            name: 'Independent Houses',
            nameTa: 'தனி வீடுகள்',
            description: 'Ready-to-occupy & custom-built individual houses with private compound.',
            displayOrder: 3,
            isSystem: true,
            metadata: { typicalUnits: '2, 3 & 4 BHK', icon: 'Home' },
        },
        {
            type: 'property_category',
            group: 'property',
            code: 'villas',
            name: 'Luxury Villas',
            nameTa: 'சொகுசு வில்லாக்கள்',
            description: 'Architectural duplex and triplex villas in secured gated enclaves.',
            displayOrder: 4,
            isSystem: true,
            metadata: { typicalUnits: '3 to 5 BHK', icon: 'Castle' },
        },
        {
            type: 'property_category',
            group: 'property',
            code: 'apartments',
            name: 'Apartments & Flats',
            nameTa: 'அபார்ட்மெண்ட்கள்',
            description: 'Modern lifestyle flats and gated community high-rises near IT corridors.',
            displayOrder: 5,
            isSystem: true,
            metadata: { typicalUnits: '1, 2, 3 & 4 BHK', icon: 'Building' },
        },
        {
            type: 'property_category',
            group: 'property',
            code: 'commercial-properties',
            name: 'Commercial Properties',
            nameTa: 'வணிக இடங்கள்',
            description: 'Retail showrooms, prime highway frontage plots, warehouses & office spaces.',
            displayOrder: 6,
            isSystem: true,
            metadata: { typicalUnits: 'Sq.ft / Cents', icon: 'Briefcase' },
        },
        // Subcategories
        { type: 'property_subcategory', group: 'property', code: 'dtcp-gated-plots', name: 'DTCP Gated Layout Plots', nameTa: 'டி.டி.சி.பி அங்கீகரிக்கப்பட்ட மனைகள்', parentCode: 'residential-plots', displayOrder: 1 },
        { type: 'property_subcategory', group: 'property', code: 'cmda-approved-plots', name: 'CMDA Approved Villa Plots', nameTa: 'சி.எம்.டி.ஏ வீட்டு மனைகள்', parentCode: 'residential-plots', displayOrder: 2 },
        { type: 'property_subcategory', group: 'property', code: 'individual-house-site', name: 'Individual House Site', nameTa: 'தனி மனை இடம்', parentCode: 'residential-plots', displayOrder: 3 },
        { type: 'property_subcategory', group: 'property', code: 'coconut-grove', name: 'Coconut Farmland', nameTa: 'தென்னந்தோப்பு நிலம்', parentCode: 'agricultural-land', displayOrder: 1 },
        { type: 'property_subcategory', group: 'property', code: 'red-soil-farm', name: 'Fertile Red Soil Farmland', nameTa: 'செம்மண் விவசாய பூமி', parentCode: 'agricultural-land', displayOrder: 2 },
        { type: 'property_subcategory', group: 'property', code: 'tea-plantation', name: 'Tea Plantation Estate', nameTa: 'தேயிலைத் தோட்டம்', parentCode: 'agricultural-land', displayOrder: 3 },
        { type: 'property_subcategory', group: 'property', code: 'duplex-house', name: 'Duplex Independent House', nameTa: 'டூப்ளக்ஸ் தனி வீடு', parentCode: 'independent-houses', displayOrder: 1 },
        { type: 'property_subcategory', group: 'property', code: 'single-floor-bungalow', name: 'Single Floor Bungalow', nameTa: 'ஒற்றைத் தளம் பங்களா', parentCode: 'independent-houses', displayOrder: 2 },
        { type: 'property_subcategory', group: 'property', code: 'gated-community-villa', name: 'Gated Enclave Villa', nameTa: 'நுழைவாயில் சமூக வில்லா', parentCode: 'villas', displayOrder: 1 },
        { type: 'property_subcategory', group: 'property', code: 'hill-view-bungalow', name: 'Hill View Heritage Bungalow', nameTa: 'மலைக்காட்சி பங்களா', parentCode: 'villas', displayOrder: 2 },
        { type: 'property_subcategory', group: 'property', code: 'smart-it-flat', name: 'Smart High-Rise Flat', nameTa: 'ஸ்மார்ட் அடுக்குமாடி குடியிருப்பு', parentCode: 'apartments', displayOrder: 1 },
        { type: 'property_subcategory', group: 'property', code: 'highway-commercial-complex', name: 'Highway Frontage Commercial', nameTa: 'நெடுஞ்சாலை வணிக வளாகம்', parentCode: 'commercial-properties', displayOrder: 1 },
        { type: 'property_subcategory', group: 'property', code: 'industrial-warehouse', name: 'Industrial Warehouse & Shed', nameTa: 'தொழில்துறை குடோன்', parentCode: 'commercial-properties', displayOrder: 2 },
        // Transaction Types
        { type: 'transaction_type', group: 'property', code: 'buy', name: 'Buy / For Sale', nameTa: 'வாங்க / விற்பனைக்கு', displayOrder: 1, isSystem: true },
        { type: 'transaction_type', group: 'property', code: 'rent', name: 'Rent / Lease', nameTa: 'வாடகைக்கு / குத்தகைக்கு', displayOrder: 2, isSystem: true },
        // Ownership Classifications
        { type: 'ownership_type', group: 'property', code: 'company', name: 'Grounds & Gates Direct', nameTa: 'கிரவுண்ட்ஸ் & கேட்ஸ் நேரடி', displayOrder: 1, isSystem: true },
        { type: 'ownership_type', group: 'property', code: 'third-party', name: 'Verified Third-Party Seller', nameTa: 'சரிபார்க்கப்பட்ட வெளி விற்பனையாளர்', displayOrder: 2, isSystem: true },
        // Facing Directions
        { type: 'facing_direction', group: 'property', code: 'north', name: 'North', nameTa: 'வடக்கு', displayOrder: 1 },
        { type: 'facing_direction', group: 'property', code: 'south', name: 'South', nameTa: 'தெற்கு', displayOrder: 2 },
        { type: 'facing_direction', group: 'property', code: 'east', name: 'East', nameTa: 'கிழக்கு', displayOrder: 3 },
        { type: 'facing_direction', group: 'property', code: 'west', name: 'West', nameTa: 'மேற்கு', displayOrder: 4 },
        { type: 'facing_direction', group: 'property', code: 'north-east', name: 'North-East', nameTa: 'வடகிழக்கு (ஈசானியம்)', displayOrder: 5 },
        { type: 'facing_direction', group: 'property', code: 'north-west', name: 'North-West', nameTa: 'வடமேற்கு (வாயு)', displayOrder: 6 },
        { type: 'facing_direction', group: 'property', code: 'south-east', name: 'South-East', nameTa: 'தென்கிழக்கு (அக்னி)', displayOrder: 7 },
        { type: 'facing_direction', group: 'property', code: 'south-west', name: 'South-West', nameTa: 'தென்மேற்கு (நைருதி)', displayOrder: 8 },
        // Road Types
        { type: 'road_type', group: 'property', code: 'tar-road', name: 'Blacktop Tar Road (40ft)', nameTa: 'தார் சாலை (40 அடி)', displayOrder: 1 },
        { type: 'road_type', group: 'property', code: 'concrete-road', name: 'Concrete Paver Road (30ft)', nameTa: 'கான்கிரீட் சாலை (30 அடி)', displayOrder: 2 },
        { type: 'road_type', group: 'property', code: 'commercial-highway', name: 'Four/Six Lane Highway', nameTa: 'பிரதான நெடுஞ்சாலை', displayOrder: 3 },
        { type: 'road_type', group: 'property', code: 'layout-internal', name: 'Layout Internal Road (23ft)', nameTa: 'உட்புற சாலை (23 அடி)', displayOrder: 4 },
        // Area Units (with conversion factor to square feet)
        {
            type: 'area_unit',
            group: 'property',
            code: 'cents',
            name: 'Cents',
            nameTa: 'சென்ட்',
            displayOrder: 1,
            isSystem: true,
            metadata: { conversionFactorToSqft: 435.6, symbol: 'ct' },
        },
        {
            type: 'area_unit',
            group: 'property',
            code: 'sq.ft',
            name: 'Square Feet',
            nameTa: 'சதுர அடி',
            displayOrder: 2,
            isSystem: true,
            metadata: { conversionFactorToSqft: 1.0, symbol: 'sq.ft' },
        },
        {
            type: 'area_unit',
            group: 'property',
            code: 'acres',
            name: 'Acres',
            nameTa: 'ஏக்கர்',
            displayOrder: 3,
            isSystem: true,
            metadata: { conversionFactorToSqft: 43560.0, symbol: 'ac' },
        },
        {
            type: 'area_unit',
            group: 'property',
            code: 'grounds',
            name: 'Grounds',
            nameTa: 'கிரவுண்ட்',
            displayOrder: 4,
            isSystem: true,
            metadata: { conversionFactorToSqft: 2400.0, symbol: 'gr' },
        },
        // Approval Authorities
        { type: 'approval_authority', group: 'property', code: 'dtcp', name: 'DTCP Approved', nameTa: 'டி.டி.சி.பி அங்கீகாரம்', displayOrder: 1 },
        { type: 'approval_authority', group: 'property', code: 'cmda', name: 'CMDA Approved', nameTa: 'சி.எம்.டி.ஏ அங்கீகாரம்', displayOrder: 2 },
        { type: 'approval_authority', group: 'property', code: 'rera', name: 'RERA Registered', nameTa: 'ரேரா பதிவு', displayOrder: 3 },
        { type: 'approval_authority', group: 'property', code: 'panchayat', name: 'Panchayat Approved', nameTa: 'பஞ்சாயத்து அனுமதி', displayOrder: 4 },
        { type: 'approval_authority', group: 'property', code: 'patta', name: 'Clear Agricultural Patta', nameTa: 'தெளிவான பட்டா', displayOrder: 5 },
        // Document Types
        { type: 'document_type', group: 'property', code: 'sale-deed', name: 'Title / Sale Deed', nameTa: 'கிரய பத்திரம்', displayOrder: 1 },
        { type: 'document_type', group: 'property', code: 'patta-chitta', name: 'Patta Chitta & FMB', nameTa: 'பட்டா சிட்டா மற்றும் வரைபடம்', displayOrder: 2 },
        { type: 'document_type', group: 'property', code: 'encumbrance-cert', name: 'Encumbrance Certificate (EC)', nameTa: 'வில்லங்கச் சான்றிதழ்', displayOrder: 3 },
        { type: 'document_type', group: 'property', code: 'layout-plan', name: 'Approved Layout Plan', nameTa: 'அங்கீகரிக்கப்பட்ட மனை வரைபடம்', displayOrder: 4 },
        { type: 'document_type', group: 'property', code: 'mother-deed', name: 'Mother / Parent Deed (30 Yrs)', nameTa: 'தாய் பத்திரம்', displayOrder: 5 },
        { type: 'document_type', group: 'property', code: 'rera-certificate', name: 'RERA Registration Certificate', nameTa: 'ரேரா சான்றிதழ்', displayOrder: 6 },
        { type: 'document_type', group: 'property', code: 'legal-opinion', name: 'High Court Advocate Legal Opinion', nameTa: 'வழக்கறிஞர் சட்டக் கருத்துரை', displayOrder: 7 },
        // Amenities
        { type: 'amenity', group: 'property', code: 'security-24x7', name: '24/7 Security & Guard Room', nameTa: '24/7 பாதுகாப்பு வசதி', displayOrder: 1, metadata: { icon: 'Security' } },
        { type: 'amenity', group: 'property', code: 'gated-arch', name: 'Grand Entrance Arch & Boom Barrier', nameTa: 'பிரமாண்ட நுழைவு வளைவு', displayOrder: 2, metadata: { icon: 'DoorFront' } },
        { type: 'amenity', group: 'property', code: 'blacktop-roads', name: '40ft & 30ft Blacktop Tar Roads', nameTa: 'அகலமான தார் சாலைகள்', displayOrder: 3, metadata: { icon: 'DirectionsCar' } },
        { type: 'amenity', group: 'property', code: 'borewell-water', name: 'Individual Borewell / Potable Water', nameTa: 'குடிநீர் வசதி & ஆழ்துளை கிணறு', displayOrder: 4, metadata: { icon: 'WaterDrop' } },
        { type: 'amenity', group: 'property', code: 'solar-lights', name: 'Solar Streetlights & Underground Cables', nameTa: 'சூரிய ஒளி விளக்குகள்', displayOrder: 5, metadata: { icon: 'WbSunny' } },
        { type: 'amenity', group: 'property', code: 'compound-wall', name: 'Secured Perimeter Compound Wall', nameTa: 'சுற்றுச்சுவர் பாதுகாப்பு', displayOrder: 6, metadata: { icon: 'Fence' } },
        { type: 'amenity', group: 'property', code: 'underground-drainage', name: 'Underground Stormwater Drainage', nameTa: 'மழைநீர் வடிகால் வசதி', displayOrder: 7, metadata: { icon: 'WaterDamage' } },
        { type: 'amenity', group: 'property', code: 'children-park', name: 'Landscaped Park & Children Play Area', nameTa: 'பூங்கா மற்றும் குழந்தைகள் விளையாட்டுப் பகுதி', displayOrder: 8, metadata: { icon: 'Park' } },
        { type: 'amenity', group: 'property', code: 'club-house', name: 'Club House & Multipurpose Hall', nameTa: 'கிளப் ஹவுஸ்', displayOrder: 9, metadata: { icon: 'HomeWork' } },
        { type: 'amenity', group: 'property', code: 'swimming-pool', name: 'Swimming Pool', nameTa: 'நீச்சல் குளம்', displayOrder: 10, metadata: { icon: 'Pool' } },
        { type: 'amenity', group: 'property', code: 'ev-charging', name: 'EV Vehicle Charging Station', nameTa: 'மின்சார வாகன சார்ஜிங் நிலையம்', displayOrder: 11, metadata: { icon: 'EvStation' } },
        // ==========================================
        // 3. CRM MASTERS
        // ==========================================
        // Lead Sources
        { type: 'lead_source', group: 'crm', code: 'website', name: 'Website Property Enquiry', nameTa: 'வலைத்தள நேரடி விசாரணை', displayOrder: 1 },
        { type: 'lead_source', group: 'crm', code: 'phone', name: 'Direct Phone Inbound', nameTa: 'தொலைபேசி அழைப்பு', displayOrder: 2 },
        { type: 'lead_source', group: 'crm', code: 'whatsapp', name: 'WhatsApp Official Chat', nameTa: 'வாட்ஸ்அப் அரட்டை', displayOrder: 3 },
        { type: 'lead_source', group: 'crm', code: 'walk-in', name: 'Office Direct Walk-in', nameTa: 'அலுவலக நேரடி வருகை', displayOrder: 4 },
        { type: 'lead_source', group: 'crm', code: 'referral', name: 'Client / Channel Referral', nameTa: 'பரிந்துரை (Referral)', displayOrder: 5 },
        { type: 'lead_source', group: 'crm', code: 'contact-form', name: 'General Contact Form', nameTa: 'தொடர்பு படிவம்', displayOrder: 6 },
        // Lead Priorities
        { type: 'lead_priority', group: 'crm', code: 'urgent', name: 'Urgent', nameTa: 'அவசரம்', displayOrder: 1, isSystem: true, metadata: { color: '#B3261E' } },
        { type: 'lead_priority', group: 'crm', code: 'high', name: 'High', nameTa: 'உயர் முன்னுரிமை', displayOrder: 2, isSystem: true, metadata: { color: '#C99325' } },
        { type: 'lead_priority', group: 'crm', code: 'medium', name: 'Medium', nameTa: 'நடுத்தர முன்னுரிமை', displayOrder: 3, isSystem: true, metadata: { color: '#0284C7' } },
        { type: 'lead_priority', group: 'crm', code: 'low', name: 'Low', nameTa: 'குறைந்த முன்னுரிமை', displayOrder: 4, isSystem: true, metadata: { color: '#64748B' } },
        // Lost Lead Reasons
        { type: 'lost_lead_reason', group: 'crm', code: 'budget-mismatch', name: 'Budget Mismatch', nameTa: 'பட்ஜெட் பொருத்தமின்மை', displayOrder: 1 },
        { type: 'lost_lead_reason', group: 'crm', code: 'location-mismatch', name: 'Location Distance / Mismatch', nameTa: 'இருப்பிட தூரம் / விருப்பமின்மை', displayOrder: 2 },
        { type: 'lost_lead_reason', group: 'crm', code: 'purchased-elsewhere', name: 'Purchased with Other Developer', nameTa: 'பிற இடத்தில் வாங்கிவிட்டார்', displayOrder: 3 },
        { type: 'lost_lead_reason', group: 'crm', code: 'loan-rejected', name: 'Bank Home Loan Rejected', nameTa: 'வங்கி கடன் நிராகரிப்பு', displayOrder: 4 },
        { type: 'lost_lead_reason', group: 'crm', code: 'postponed', name: 'Dropped / Postponed Investment', nameTa: 'திட்டம் தள்ளிவைக்கப்பட்டது', displayOrder: 5 },
        // Follow-up Types
        { type: 'follow_up_type', group: 'crm', code: 'phone-call', name: 'Phone Call', nameTa: 'தொலைபேசி அழைப்பு', displayOrder: 1 },
        { type: 'follow_up_type', group: 'crm', code: 'whatsapp-msg', name: 'WhatsApp Message', nameTa: 'வாட்ஸ்அப் தகவல்', displayOrder: 2 },
        { type: 'follow_up_type', group: 'crm', code: 'site-visit-coord', name: 'Site Visit Coordination', nameTa: 'தள ஆய்வு ஒருங்கிணைப்பு', displayOrder: 3 },
        { type: 'follow_up_type', group: 'crm', code: 'in-person-meeting', name: 'In-person Office Meeting', nameTa: 'நேரடி சந்திப்பு', displayOrder: 4 },
        { type: 'follow_up_type', group: 'crm', code: 'document-review', name: 'Document / Legal Verification', nameTa: 'ஆவண சரிபார்ப்பு', displayOrder: 5 },
        // Task Categories
        { type: 'task_category', group: 'crm', code: 'client-followup', name: 'Client Follow-up', nameTa: 'வாடிக்கையாளர் தொடர்வு', displayOrder: 1 },
        { type: 'task_category', group: 'crm', code: 'site-visit-prep', name: 'Site Visit Preparation', nameTa: 'தள ஆய்வு தயாரிப்பு', displayOrder: 2 },
        { type: 'task_category', group: 'crm', code: 'document-collection', name: 'Legal Document Collection', nameTa: 'சட்ட ஆவணங்கள் சேகரிப்பு', displayOrder: 3 },
        { type: 'task_category', group: 'crm', code: 'payment-followup', name: 'Payment & Token Follow-up', nameTa: 'பணம் வசூல் தொடர்வு', displayOrder: 4 },
        { type: 'task_category', group: 'crm', code: 'general-crm', name: 'General Operations', nameTa: 'பொது செயல்பாடுகள்', displayOrder: 5 },
        // Visit Purposes
        { type: 'visit_purpose', group: 'crm', code: 'first-inspection', name: 'First Physical Inspection', nameTa: 'முதல் நேரடி பார்வை', displayOrder: 1 },
        { type: 'visit_purpose', group: 'crm', code: 'family-visit', name: 'Family Decision Visit', nameTa: 'குடும்பத்தினருடன் ஆய்வு', displayOrder: 2 },
        { type: 'visit_purpose', group: 'crm', code: 'architect-check', name: 'Architect / Engineer Assessment', nameTa: 'பொறியாளர் ஆய்வு', displayOrder: 3 },
        { type: 'visit_purpose', group: 'crm', code: 'token-booking', name: 'Final Token Booking & Handshake', nameTa: 'முன்பதிவு உறுதிப்படுத்தல்', displayOrder: 4 },
        // Visit Time Slots
        {
            type: 'visit_time_slot',
            group: 'crm',
            code: 'morning',
            name: 'Morning (9:00 AM - 12:00 PM)',
            nameTa: 'காலை (9 AM - 12 PM)',
            displayOrder: 1,
            isSystem: true,
            metadata: { start: '09:00', end: '12:00' },
        },
        {
            type: 'visit_time_slot',
            group: 'crm',
            code: 'afternoon',
            name: 'Afternoon (12:00 PM - 4:00 PM)',
            nameTa: 'மதியம் (12 PM - 4 PM)',
            displayOrder: 2,
            isSystem: true,
            metadata: { start: '12:00', end: '16:00' },
        },
        {
            type: 'visit_time_slot',
            group: 'crm',
            code: 'evening',
            name: 'Evening (4:00 PM - 7:00 PM)',
            nameTa: 'மாலை (4 PM - 7 PM)',
            displayOrder: 3,
            isSystem: true,
            metadata: { start: '16:00', end: '19:00' },
        },
        // Cancellation Reasons
        { type: 'cancellation_reason', group: 'crm', code: 'client-unavailable', name: 'Client Unavailable / Emergency', nameTa: 'வாடிக்கையாளர் அவசர வேலை', displayOrder: 1 },
        { type: 'cancellation_reason', group: 'crm', code: 'weather-condition', name: 'Adverse Weather / Rain', nameTa: 'மழை / மோசமான வானிலை', displayOrder: 2 },
        { type: 'cancellation_reason', group: 'crm', code: 'owner-rescheduled', name: 'Owner / Caretaker Unavailable', nameTa: 'உரிமையாளர் நேரம் மாற்றினார்', displayOrder: 3 },
        // Booking Cancellation Reasons
        { type: 'booking_cancellation_reason', group: 'crm', code: 'loan-disapproval', name: 'Bank Home Loan Disapproval', nameTa: 'வங்கி கடன் கிடைக்கவில்லை', displayOrder: 1 },
        { type: 'booking_cancellation_reason', group: 'crm', code: 'title-issue', name: 'Buyer Legal Title Reservation', nameTa: 'ஆவண ஆட்சேபனை', displayOrder: 2 },
        { type: 'booking_cancellation_reason', group: 'crm', code: 'family-emergency', name: 'Personal Financial Emergency', nameTa: 'தனிப்பட்ட நிதி நெருக்கடி', displayOrder: 3 },
        // Payment Methods
        { type: 'payment_method', group: 'crm', code: 'neft-rtgs', name: 'Net Banking / NEFT / RTGS', nameTa: 'வங்கி நேரடி பரிவர்த்தனை (NEFT/RTGS)', displayOrder: 1, isSystem: true },
        { type: 'payment_method', group: 'crm', code: 'upi', name: 'UPI Direct (GPay / PhonePe)', nameTa: 'யு.பி.ஐ (UPI)', displayOrder: 2, isSystem: true },
        { type: 'payment_method', group: 'crm', code: 'demand-draft', name: 'Demand Draft (DD)', nameTa: 'வங்கி டிமாண்ட் டிராப்ட் (DD)', displayOrder: 3, isSystem: true },
        { type: 'payment_method', group: 'crm', code: 'cheque', name: 'Account Payee Cheque', nameTa: 'காசோலை (Cheque)', displayOrder: 4, isSystem: true },
        // Payment Adjustment Reasons
        { type: 'payment_adjustment_reason', group: 'crm', code: 'token-deduction', name: 'Advance Token Amount Deduction', nameTa: 'முன்பண கழிவு', displayOrder: 1, isSystem: true },
        { type: 'payment_adjustment_reason', group: 'crm', code: 'special-discount', name: 'Management Approved Discount', nameTa: 'நிர்வாக சிறப்பு தள்ளுபடி', displayOrder: 2, isSystem: true },
        { type: 'payment_adjustment_reason', group: 'crm', code: 'registration-waiver', name: 'Documentation Fee Waiver', nameTa: 'ஆவண கட்டண தள்ளுபடி', displayOrder: 3, isSystem: true },
        // ==========================================
        // 4. ORGANIZATION MASTERS
        // ==========================================
        {
            type: 'branch',
            group: 'organization',
            code: 'cbe-headquarters',
            name: 'Coimbatore Corporate Headquarters',
            nameTa: 'கோவை தலைமை அலுவலகம்',
            displayOrder: 1,
            metadata: { address: 'Race Course Road, Coimbatore - 641018', phone: '+91 422 298 7000' },
        },
        {
            type: 'branch',
            group: 'organization',
            code: 'chennai-omr-branch',
            name: 'Chennai Metro Regional Office',
            nameTa: 'சென்னை மண்டல அலுவலகம்',
            displayOrder: 2,
            metadata: { address: 'Old Mahabalipuram Road (OMR), Perungudi, Chennai - 600096', phone: '+91 44 4890 2200' },
        },
        {
            type: 'branch',
            group: 'organization',
            code: 'madurai-south-branch',
            name: 'Madurai Southern Hub',
            nameTa: 'மதுரை தென்மண்டல மையம்',
            displayOrder: 3,
            metadata: { address: 'KK Nagar, Madurai - 625020', phone: '+91 452 258 1100' },
        },
        { type: 'department', group: 'organization', code: 'sales-crm', name: 'Sales & Client CRM', nameTa: 'விற்பனை மற்றும் வாடிக்கையாளர் மேலாண்மை', displayOrder: 1 },
        { type: 'department', group: 'organization', code: 'legal-due-diligence', name: 'Legal Titles & Due Diligence', nameTa: 'சட்ட ஆவண சரிபார்ப்பு', displayOrder: 2 },
        { type: 'department', group: 'organization', code: 'acquisitions', name: 'Property Land Acquisitions', nameTa: 'சொத்து கையகப்படுத்தல்', displayOrder: 3 },
        { type: 'department', group: 'organization', code: 'marketing-tech', name: 'Technology & Marketing', nameTa: 'தொழில்நுட்பம் மற்றும் சந்தைப்படுத்தல்', displayOrder: 4 },
        { type: 'designation', group: 'organization', code: 'vice-president', name: 'Vice President of Sales', nameTa: 'விற்பனை துணைத் தலைவர்', displayOrder: 1 },
        { type: 'designation', group: 'organization', code: 'branch-head', name: 'Branch Operations Head', nameTa: 'கிளை மேலாளர்', displayOrder: 2 },
        { type: 'designation', group: 'organization', code: 'sr-relationship-mgr', name: 'Senior Relationship Manager', nameTa: 'முதுநிலை வாடிக்கையாளர் மேலாளர்', displayOrder: 3 },
        { type: 'designation', group: 'organization', code: 'legal-counsel', name: 'Senior Legal Advocate', nameTa: 'முதுநிலை வழக்கறிஞர்', displayOrder: 4 },
        { type: 'designation', group: 'organization', code: 'sales-executive', name: 'Sales & Field Executive', nameTa: 'விற்பனை அதிகாரி', displayOrder: 5 },
        { type: 'team', group: 'organization', code: 'team-cbe-alpha', name: 'Alpha Sales Coimbatore', nameTa: 'ஆல்ஃபா விற்பனை அணி (கோவை)', parentCode: 'cbe-headquarters', displayOrder: 1 },
        { type: 'team', group: 'organization', code: 'team-chennai-metro', name: 'Chennai Metro Acquisitions Desk', nameTa: 'சென்னை மெட்ரோ பிரிவு', parentCode: 'chennai-omr-branch', displayOrder: 2 },
    ];
    let mastersCount = 0;
    for (const m of mastersData) {
        await MasterItem.findOneAndUpdate({ type: m.type, code: m.code }, { $setOnInsert: m }, { upsert: true, new: true });
        mastersCount++;
    }
    console.log(`✅ Seeded / Verified ${mastersCount} Centralized Master Records.`);
    // ==========================================
    // 5. SEED WEBSITE CONTENT
    // ==========================================
    const contentSections = [
        {
            section: 'homepage_hero',
            title: 'Find More Than a Property. Find Your Place in the World.',
            titleTa: 'ஒரு சொத்தை விட மேலானதைக் கண்டறியுங்கள். உங்கள் உலகளாவிய இடத்தை உருவாக்குங்கள்.',
            subtitle: 'Explore thoughtfully presented, legally verified properties across Coimbatore, Chennai, and key Tamil Nadu corridors.',
            subtitleTa: 'கோயம்புத்தூர், சென்னை மற்றும் தமிழ்நாட்டின் முக்கிய பகுதிகளில் கவனமாக சரிபார்க்கப்பட்ட சொத்துக்களை ஆராயுங்கள்.',
            content: {
                headlineBadge: 'Tamil Nadu Dedicated Property Platform',
                headlineBadgeTa: 'தமிழ்நாட்டின் பிரத்யேக ரியல் எஸ்டேட் தளம்',
                ctaPrimaryText: 'Explore Verified Properties',
                ctaPrimaryTextTa: 'சொத்துக்களைக் காண்க',
                ctaSecondaryText: 'Post Your Property (Free)',
                ctaSecondaryTextTa: 'சொத்தை இலவசமாக பதிவிட',
                backgroundOverlayOpacity: 0.65,
                stats: [
                    { label: 'Verified Listings', labelTa: 'சரிபார்க்கப்பட்ட சொத்துக்கள்', value: '30+' },
                    { label: 'Key Tamil Nadu Hubs', labelTa: 'வளர்ச்சி மையங்கள்', value: '10' },
                    { label: 'Title Verified', labelTa: 'பட்டா & ஆவண சரிபார்ப்பு', value: '100%' },
                ],
            },
            status: 'published',
            version: 1,
            publishedAt: new Date(),
        },
        {
            section: 'about_page',
            title: 'About Grounds & Gates',
            titleTa: 'கிரவுண்ட்ஸ் & கேட்ஸ் பற்றி',
            subtitle: 'Property Decisions Simplified through Legal Diligence and Transparent Technology.',
            subtitleTa: 'சட்ட விழிப்புணர்வு மற்றும் வெளிப்படையான தொழில்நுட்பம் மூலம் எளிய சொத்து முடிவுகள்.',
            content: {
                mission: 'To create Tamil Nadu’s most dependable real estate marketplace by eliminating title opacity and providing direct developer & owner access.',
                missionTa: 'ஆவண வெளிப்படைத்தன்மையை உறுதி செய்து, வாங்குபவர்களுக்கும் உரிமையாளர்களுக்கும் நேரடி தொடர்பை ஏற்படுத்தி நம்பகமான தளமாக விளங்குதல்.',
                story: 'Founded in Coimbatore, Grounds & Gates combines decades of regional real estate surveying expertise with modern bilingual property technology.',
                storyTa: 'கோயம்புத்தூரில் தொடங்கப்பட்ட கிரவுண்ட்ஸ் & கேட்ஸ், பல தசாப்த கால கள அனுபவத்தையும் நவீன இருமொழி தொழில்நுட்பத்தையும் ஒன்றிணைக்கிறது.',
                coreValues: [
                    { title: 'Zero Title Ambiguity', titleTa: 'முழுமையான ஆவண உண்மைத்தன்மை', desc: '100% legal title verification before listing promotion.' },
                    { title: 'Bilingual Accessibility', titleTa: 'முழு இருமொழி சேவை', desc: 'Tamil & English interfaces for true grassroots transparency.' },
                    { title: 'Direct Value', titleTa: 'நேரடி பலன்', desc: 'Zero hidden intermediary markups for genuine property decisions.' },
                ],
            },
            status: 'published',
            version: 1,
            publishedAt: new Date(),
        },
        {
            section: 'contact_page',
            title: 'Contact Our Advisory Concierge',
            titleTa: 'எங்கள் ஆலோசனை மையத்தைத் தொடர்பு கொள்ளுங்கள்',
            subtitle: 'Connect with our regional offices across Coimbatore, Chennai, and Madurai.',
            subtitleTa: 'கோவை, சென்னை மற்றும் மதுரை மண்டல அலுவலகங்களுடன் இணையுங்கள்.',
            content: {
                primaryPhone: '+91 98422 71000',
                secondaryPhone: '+91 422 298 7000',
                supportEmail: 'contact@groundsandgates.com',
                operationalHours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
                operationalHoursTa: 'திங்கள் – சனி: காலை 9:00 மணி முதல் மாலை 7:00 மணி வரை',
                offices: [
                    {
                        name: 'Coimbatore Corporate Headquarters',
                        nameTa: 'கோவை தலைமை அலுவலகம்',
                        address: 'Race Course Road, Coimbatore, Tamil Nadu - 641018',
                        phone: '+91 422 298 7000',
                    },
                    {
                        name: 'Chennai Metro Regional Office',
                        nameTa: 'சென்னை மண்டல அலுவலகம்',
                        address: 'Old Mahabalipuram Road (OMR), Perungudi, Chennai - 600096',
                        phone: '+91 44 4890 2200',
                    },
                ],
            },
            status: 'published',
            version: 1,
            publishedAt: new Date(),
        },
        {
            section: 'faqs',
            title: 'Frequently Asked Questions',
            titleTa: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
            subtitle: 'Common questions regarding title verification, site visits, and escrow facilitation.',
            subtitleTa: 'ஆவண சரிபார்ப்பு, தள ஆய்வுகள் மற்றும் முன்பதிவு தொடர்பான பொதுவான கேள்விகள்.',
            content: {
                items: [
                    {
                        q: 'How does Grounds & Gates verify property titles?',
                        qTa: 'கிரவுண்ட்ஸ் & கேட்ஸ் எவ்வாறு சொத்து ஆவணங்களை சரிபார்க்கிறது?',
                        a: 'Our in-house legal team cross-checks 30-year Encumbrance Certificates, Patta Chitta, and DTCP/CMDA approvals against state registration databases.',
                        aTa: 'எங்கள் சட்டக் குழுவினர் 30 ஆண்டுகால வில்லங்கச் சான்றிதழ், பட்டா சிட்டா மற்றும் அரசு அங்கீகாரங்களை முழுமையாக சரிபார்க்கின்றனர்.',
                    },
                    {
                        q: 'Is there any fee to schedule a physical site visit?',
                        qTa: 'நேரடி தள ஆய்வுக்கு ஏதேனும் கட்டணம் உண்டா?',
                        a: 'No. Site visits scheduled through the Grounds & Gates portal are 100% free with optional executive concierge escort.',
                        aTa: 'இல்லை. எங்கள் தளம் வழியாக முன்பதிவு செய்யப்படும் தள ஆய்வுகள் முற்றிலும் இலவசமானவை.',
                    },
                    {
                        q: 'Can private property owners post their listings for free?',
                        qTa: 'தனிநபர் உரிமையாளர்கள் தங்கள் சொத்தை இலவசமாக பதிவிட முடியுமா?',
                        a: 'Yes. Individual sellers and landlords can list approved properties directly through our 7-step wizard with zero upfront fee.',
                        aTa: 'ஆம். தனிநபர் உரிமையாளர்கள் எந்தவித கட்டணமும் இன்றி தங்கள் சொத்துக்களை நேரடியாக பதிவிடலாம்.',
                    },
                ],
            },
            status: 'published',
            version: 1,
            publishedAt: new Date(),
        },
        {
            section: 'homepage_sections',
            title: 'Homepage Layout Configuration',
            titleTa: 'முகப்புப்பக்க அமைப்பு',
            subtitle: 'Control section visibility and display order on public homepage.',
            subtitleTa: 'முகப்புப்பக்க பிரிவுகளின் தெரிவுநிலையைக் கட்டுப்படுத்தவும்.',
            content: {
                sections: [
                    { id: 'hero', name: 'Hero Banner & Search Hub', visible: true, order: 1 },
                    { id: 'corridors', name: 'Tamil Nadu Regional Hubs', visible: true, order: 2 },
                    { id: 'categories', name: 'Explore Categories', visible: true, order: 3 },
                    { id: 'featured', name: 'Featured Verified Properties', visible: true, order: 4 },
                    { id: 'trust', name: 'Title Diligence & Legal Trust', visible: true, order: 5 },
                    { id: 'faqs', name: 'Frequently Asked Questions', visible: true, order: 6 },
                    { id: 'concierge', name: 'Concierge Desk CTA', visible: true, order: 7 },
                ],
            },
            status: 'published',
            version: 1,
            publishedAt: new Date(),
        },
    ];
    let contentCount = 0;
    for (const c of contentSections) {
        const existing = await WebContent.findOne({ section: c.section });
        if (!existing) {
            await WebContent.create({
                ...c,
                draftContent: JSON.parse(JSON.stringify(c.content)),
            });
        }
        else {
            // Ensure published content is populated if empty
            if (!existing.content || Object.keys(existing.content).length === 0) {
                existing.content = JSON.parse(JSON.stringify(c.content));
                existing.draftContent = JSON.parse(JSON.stringify(c.content));
                existing.status = 'published';
                await existing.save();
            }
        }
        contentCount++;
    }
    console.log(`✅ Seeded / Verified ${contentCount} Web Content Sections.`);
    return { mastersCount, contentCount };
};
/**
 * Reconciles existing database records against Master codes.
 * Returns an audit report and does NOT destructively overwrite unmapped values.
 */
export const runMastersMigration = async (isDryRun = true) => {
    console.log(`🔍 Running Centralized Masters Reconciliation Migration (Dry Run: ${isDryRun})...`);
    // Load master codes for verification
    const [categories, districts, localities, facingDirections, areaUnits, leadSources, paymentMethods] = await Promise.all([
        MasterItem.find({ type: 'property_category' }).select('code name').lean(),
        MasterItem.find({ type: 'district' }).select('code name').lean(),
        MasterItem.find({ type: 'locality' }).select('code name parentCode').lean(),
        MasterItem.find({ type: 'facing_direction' }).select('code name').lean(),
        MasterItem.find({ type: 'area_unit' }).select('code name').lean(),
        MasterItem.find({ type: 'lead_source' }).select('code name').lean(),
        MasterItem.find({ type: 'payment_method' }).select('code name').lean(),
    ]);
    const catCodes = new Set(categories.map((c) => c.code.toLowerCase()));
    const distCodes = new Set(districts.map((d) => d.code.toLowerCase()));
    const distNames = new Set(districts.map((d) => d.name.toLowerCase()));
    const locCodes = new Set(localities.map((l) => l.code.toLowerCase()));
    const locNames = new Set(localities.map((l) => l.name.toLowerCase()));
    const facingNames = new Set(facingDirections.map((f) => f.name.toLowerCase()));
    const unitCodes = new Set(areaUnits.map((u) => u.code.toLowerCase()));
    const sourceCodes = new Set(leadSources.map((s) => s.code.toLowerCase()));
    const paymentCodes = new Set(paymentMethods.map((p) => p.name.toLowerCase()));
    // 1. Reconcile Properties
    const properties = await Property.find().lean();
    let matchedCat = 0;
    let matchedDist = 0;
    let matchedLoc = 0;
    let matchedFacing = 0;
    let matchedUnit = 0;
    const unmatchedProperties = [];
    for (const prop of properties) {
        const issues = [];
        if (catCodes.has(String(prop.category).toLowerCase()))
            matchedCat++;
        else
            issues.push(`Unmatched category: '${prop.category}'`);
        const distLower = String(prop.district).toLowerCase();
        if (distCodes.has(distLower) || distNames.has(distLower))
            matchedDist++;
        else
            issues.push(`Unmatched district: '${prop.district}'`);
        const locLower = String(prop.locality).toLowerCase();
        if (locCodes.has(locLower) || locNames.has(locLower))
            matchedLoc++;
        else
            issues.push(`Unmatched locality: '${prop.locality}'`);
        if (facingNames.has(String(prop.facing).toLowerCase()))
            matchedFacing++;
        else
            issues.push(`Unmatched facing: '${prop.facing}'`);
        if (unitCodes.has(String(prop.plotAreaUnit).toLowerCase()))
            matchedUnit++;
        else
            issues.push(`Unmatched area unit: '${prop.plotAreaUnit}'`);
        if (issues.length > 0) {
            unmatchedProperties.push({
                propertyId: prop.referenceId || String(prop._id),
                title: prop.title,
                issues,
            });
        }
    }
    // 2. Reconcile Leads
    const leads = await Lead.find().lean();
    let matchedLeadSource = 0;
    let matchedLeadPriority = 0;
    let matchedLeadStage = 0;
    for (const lead of leads) {
        if (sourceCodes.has(String(lead.source).toLowerCase()))
            matchedLeadSource++;
        if (['high', 'medium', 'low', 'urgent'].includes(String(lead.priority).toLowerCase()))
            matchedLeadPriority++;
        if (['new', 'contacted', 'qualified', 'scheduled', 'negotiation', 'won', 'lost'].includes(String(lead.stage).toLowerCase()))
            matchedLeadStage++;
    }
    // 3. Reconcile Bookings
    const bookings = await Booking.find().lean();
    let matchedBkgPayment = 0;
    let matchedBkgStatus = 0;
    for (const bkg of bookings) {
        if (paymentCodes.has(String(bkg.paymentMethod).toLowerCase()))
            matchedBkgPayment++;
        if (['draft', 'token-received', 'documentation', 'registered', 'cancelled'].includes(String(bkg.status).toLowerCase()))
            matchedBkgStatus++;
    }
    const report = {
        timestamp: new Date().toISOString(),
        isDryRun,
        totalMastersSeeded: categories.length + districts.length + localities.length,
        totalContentSectionsSeeded: 5,
        propertiesReconciled: {
            total: properties.length,
            matchedCategory: matchedCat,
            matchedDistrict: matchedDist,
            matchedLocality: matchedLoc,
            matchedFacing: matchedFacing,
            matchedAreaUnit: matchedUnit,
            unmatched: unmatchedProperties,
        },
        leadsReconciled: {
            total: leads.length,
            matchedSource: matchedLeadSource,
            matchedPriority: matchedLeadPriority,
            matchedStage: matchedLeadStage,
        },
        bookingsReconciled: {
            total: bookings.length,
            matchedPaymentMethod: matchedBkgPayment,
            matchedStatus: matchedBkgStatus,
        },
    };
    console.log(`📊 Migration Dry-Run Complete: ${properties.length} Properties checked, ${unmatchedProperties.length} flagged for review.`);
    return report;
};
