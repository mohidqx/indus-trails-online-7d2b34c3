import { useState, useEffect } from 'react';
import { 
  Clock, Users, Star, Hotel, MapPin, Mountain, Utensils, Shield, 
  Camera, Thermometer, Backpack, AlertTriangle, CheckCircle2, 
  Phone, Loader2, User, TrendingUp, Sunrise, Sunset, Moon,
  Car, Footprints, Heart, Compass, Map
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { getTourImage } from '@/lib/tourImages';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';

interface HotelInfo { id: string; name: string; star_rating: number | null; }
interface Tour {
  id: string; title: string; description: string | null; duration: string | null;
  price: number; discount_price: number | null; max_group_size: number | null;
  difficulty: string | null; includes: string[] | null; image_url: string | null;
  is_featured: boolean; hotel_id: string | null; hotels: HotelInfo | null;
}

interface DestInfo { name: string; location: string | null; best_time: string | null; highlights: string[] | null; }

// Rich tour metadata keyed by partial title match
const tourMeta: Record<string, {
  itinerary: { day: string; title: string; desc: string; icon: 'sunrise' | 'mountain' | 'camera' | 'car' | 'footprints' | 'sunset' | 'moon' }[];
  meals: { breakfast: string; lunch: string; dinner: string }[];
  accommodation: string[];
  bestFor: string[];
  notRecommended: string[];
  altitude: string;
  terrain: string;
  fitnessLevel: string;
  weather: string;
  packingEssentials: string[];
  safetyTips: string[];
  photography: string[];
  emergencyInfo: string;
}> = {
  'hunza': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Chilas', desc: 'Early morning departure via Karakoram Highway. Stop at Besham for breakfast, scenic drive along Indus River through Kohistan. Arrive Chilas by evening. Total drive: ~12 hrs with stops.', icon: 'car' },
      { day: 'Day 2', title: 'Chilas → Karimabad', desc: 'Drive through Nanga Parbat viewpoint at Raikot Bridge. Visit Rakaposhi viewpoint in Ghulmet. Arrive Karimabad, explore local bazaar and enjoy sunset views of Rakaposhi (7,788m).', icon: 'sunrise' },
      { day: 'Day 3', title: 'Karimabad Exploration', desc: 'Morning visit to Baltit Fort (700+ years old UNESCO heritage). Walk down to Altit Fort & Royal Garden. Afternoon free for shopping at Women\'s Market. Evening at Eagle\'s Nest viewpoint for panoramic valley views.', icon: 'camera' },
      { day: 'Day 4', title: 'Attabad Lake & Passu', desc: 'Drive to Attabad Lake (formed in 2010 landslide), enjoy boat ride on turquoise waters. Continue to Passu to see iconic Passu Cones & suspension bridge. Visit Borith Lake. Return to Karimabad.', icon: 'mountain' },
      { day: 'Day 5', title: 'Karimabad → Islamabad', desc: 'After breakfast, begin return journey. Lunch stop at Besham. Evening arrival in Islamabad with unforgettable memories of Hunza Valley.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast buffet', lunch: 'Packed lunch / roadside dhaba', dinner: 'Local chapli kebab, daal chawal at Chilas hotel' },
      { breakfast: 'Hunza bread with apricot jam, butter tea', lunch: 'Chapshoro (traditional Hunza meat pie)', dinner: 'Diram Fitti, walnut cake, local cuisine at hotel' },
      { breakfast: 'Hunza bread, eggs, dried fruits', lunch: 'Local restaurant near Baltit Fort', dinner: 'Traditional Hunza cuisine with apricot dessert' },
      { breakfast: 'Continental + Hunza style', lunch: 'Lakeside lunch at Attabad', dinner: 'Farewell dinner at Karimabad with cultural music' },
      { breakfast: 'Hotel breakfast', lunch: 'Roadside restaurant at Besham', dinner: 'On your own in Islamabad' },
    ],
    accommodation: ['Shangri-La Chilas / Mountain Lodge (Chilas)', 'Hunza Serena Inn / Eagle\'s Nest Hotel (Karimabad)', 'Same hotel continuation', 'Same hotel continuation'],
    bestFor: ['Families with children 8+', 'Photography enthusiasts', 'History & culture lovers', 'First-time northern Pakistan visitors', 'Couples & honeymooners'],
    notRecommended: ['People with severe altitude sickness', 'Those uncomfortable with long road travel', 'Very young children under 5'],
    altitude: '2,500m (Karimabad) - highest point ~3,100m (Attabad area)',
    terrain: 'Paved highways, some rough patches. Walking on fort trails requires moderate fitness.',
    fitnessLevel: 'Low to Moderate - mostly vehicle travel with short walks at sightseeing spots',
    weather: 'Summer (May-Sep): 15-30°C pleasant. Autumn (Oct-Nov): 5-20°C crisp & colorful. Winter: Sub-zero, roads may close.',
    packingEssentials: ['Warm layers (even in summer, evenings are cold)', 'Sunscreen SPF 50+', 'Comfortable walking shoes', 'Camera with extra batteries', 'Sunglasses & hat', 'Reusable water bottle', 'Cash (ATMs are limited)', 'Motion sickness medicine', 'Power bank', 'Light rain jacket'],
    safetyTips: ['Always carry ID/passport copy', 'Drink bottled water only', 'Don\'t hike alone after dark', 'Inform hotel staff before any solo exploration', 'Respect local customs - dress modestly', 'Road conditions can change - follow guide\'s advice'],
    photography: ['Golden hour at Eagle\'s Nest (sunset)', 'Baltit Fort with Rakaposhi backdrop', 'Attabad Lake turquoise waters', 'Passu Cones reflection at dawn', 'Local markets & people (ask permission first)'],
    emergencyInfo: 'Aga Khan Health Center in Karimabad (+92-5813-XXXXX). Nearest hospital: Gilgit (2 hrs). Satellite phone available with guide.',
  },
  'skardu': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Chilas', desc: 'Depart Islamabad at dawn via KKH. Drive through scenic Indus Valley, stop at Besham & Dasu. Night stay at Chilas with views of surrounding peaks.', icon: 'car' },
      { day: 'Day 2', title: 'Chilas → Skardu', desc: 'Cross the dramatic confluence of Indus & Gilgit rivers. Drive along Indus through narrow gorges. Arrive Skardu, visit Skardu Fort (Kharpocho) for sunset views over the Indus.', icon: 'mountain' },
      { day: 'Day 3', title: 'Shangrila & Kachura Lakes', desc: 'Visit Shangrila Resort (Lower Kachura Lake) - the "Heaven on Earth". Boat ride on emerald waters. Drive to Upper Kachura Lake - pristine, less touristy, crystal clear water. Picnic lunch lakeside.', icon: 'camera' },
      { day: 'Day 4', title: 'Deosai National Park', desc: 'Full-day expedition to Deosai Plains - the "Land of Giants" (4,114m avg elevation). Spot Himalayan brown bears, golden marmots. Visit Sheosar Lake. Vast wildflower meadows in summer. Return by evening.', icon: 'footprints' },
      { day: 'Day 5', title: 'Satpara Lake & Return', desc: 'Morning visit to Satpara Lake and Satpara Buddha Rock. Begin return journey via same route. Night stop at Chilas.', icon: 'sunrise' },
      { day: 'Day 6', title: 'Chilas → Islamabad', desc: 'Early departure for Islamabad. Arrive by late evening. Tour concludes with lifetime memories.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel continental', lunch: 'Packed / roadside', dinner: 'Local Chilas cuisine - trout fish, roti' },
      { breakfast: 'Hotel breakfast', lunch: 'En-route at local restaurant', dinner: 'Skardu hotel - Balti cuisine (momo, thukpa)' },
      { breakfast: 'Hunza-style with dried apricots', lunch: 'Picnic at Upper Kachura', dinner: 'Hotel restaurant - BBQ night' },
      { breakfast: 'Packed breakfast for Deosai', lunch: 'Packed lunch at Sheosar Lake', dinner: 'Hotel celebration dinner' },
      { breakfast: 'Hotel breakfast', lunch: 'Roadside dhaba', dinner: 'Chilas hotel' },
      { breakfast: 'Early packed breakfast', lunch: 'En-route', dinner: 'Own arrangement in Islamabad' },
    ],
    accommodation: ['Mountain Lodge Chilas', 'Shangrila Resort / Mashabrum Hotel Skardu', 'Same hotel', 'Same hotel', 'Mountain Lodge Chilas'],
    bestFor: ['Adventure seekers', 'Wildlife enthusiasts', 'Photographers', 'Nature lovers', 'Those seeking solitude'],
    notRecommended: ['People with heart conditions (Deosai is 4,100m+)', 'Those prone to severe altitude sickness', 'Travelers expecting luxury amenities'],
    altitude: '2,228m (Skardu) to 4,114m (Deosai Plains)',
    terrain: 'Mix of paved roads and jeep tracks (Deosai). Requires 4x4 for Deosai section.',
    fitnessLevel: 'Moderate - high altitude at Deosai requires acclimatization',
    weather: 'Summer: 10-25°C in Skardu, near 0°C at Deosai even in July. Always carry warm clothes.',
    packingEssentials: ['Heavy warm layers for Deosai', 'Altitude sickness medicine (Diamox)', 'Sunscreen SPF 50+ & lip balm', 'Hiking boots', 'Binoculars for wildlife', 'Waterproof jacket', 'Thermal innerwear', 'Snacks for long drives', 'First aid kit', 'Torch/headlamp'],
    safetyTips: ['Acclimatize properly before Deosai', 'Stay in vehicle at Deosai if bears spotted', 'Carry cash - no ATMs beyond Skardu', 'Weather can change rapidly at high altitude', 'Keep emergency contacts saved offline', 'Travel in group - don\'t wander alone at Deosai'],
    photography: ['Sheosar Lake at sunrise', 'Upper Kachura Lake crystal waters', 'Deosai wildflower meadows (July-Aug)', 'Skardu Fort sunset panorama', 'Milky Way shots at Deosai (minimal light pollution)'],
    emergencyInfo: 'Combined Military Hospital (CMH) Skardu. Rescue 1122 available. Satellite communication via guide.',
  },
  'fairy meadows': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Raikot Bridge', desc: 'Drive via KKH to Raikot Bridge (approximately 10-12 hours). Check into guesthouse near the bridge. Prepare for next day\'s jeep ride and trek.', icon: 'car' },
      { day: 'Day 2', title: 'Raikot → Fairy Meadows', desc: 'Thrilling 2-hour jeep ride on one of the world\'s most dangerous roads (Raikot to Tattu Village). Then 3-4 hour moderate trek through pine forests to Fairy Meadows (3,300m). Stunning first views of Nanga Parbat.', icon: 'footprints' },
      { day: 'Day 3', title: 'Beyal Camp & Nanga Parbat Base', desc: 'Trek to Beyal Camp (3,500m) through enchanting forests. Optional: Continue to Nanga Parbat Base Camp (4,100m) - additional 3-4 hrs round trip. Evening campfire with mountain views.', icon: 'mountain' },
      { day: 'Day 4', title: 'Return Journey', desc: 'Morning photography session with golden light on Nanga Parbat. Trek back to Tattu, jeep to Raikot Bridge, drive to Chilas for overnight stay.', icon: 'sunrise' },
      { day: 'Day 5', title: 'Chilas → Islamabad', desc: 'Return drive to Islamabad. Arrive by evening.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Guesthouse breakfast', lunch: 'En-route roadside', dinner: 'Local cuisine at guesthouse' },
      { breakfast: 'Packed for trek', lunch: 'Packed lunch during trek', dinner: 'Camp dinner - dal, rice, roti under the stars' },
      { breakfast: 'Camp breakfast with chai', lunch: 'Packed for Beyal trek', dinner: 'Special campfire BBQ dinner' },
      { breakfast: 'Camp breakfast', lunch: 'Packed for trek down', dinner: 'Chilas hotel restaurant' },
      { breakfast: 'Hotel breakfast', lunch: 'Roadside en-route', dinner: 'Own arrangement' },
    ],
    accommodation: ['Raikot Bridge Guesthouse', 'Fairy Meadows wooden cabins / camping tents', 'Same camp', 'Chilas hotel'],
    bestFor: ['Trekkers & hikers', 'Mountain lovers', 'Astrophotography enthusiasts', 'Solo travelers', 'Those seeking raw adventure'],
    notRecommended: ['People with vertigo (jeep road is extreme)', 'Those unable to trek 3-4 hours', 'Elderly travelers', 'Young children under 10'],
    altitude: '3,300m (Fairy Meadows) to 4,100m (Base Camp)',
    terrain: 'Jeep track (very rough), forest hiking trail, steep sections to Base Camp.',
    fitnessLevel: 'Moderate to High - requires good stamina for trekking at altitude',
    weather: 'Summer: 5-20°C. Night temps can drop to 0°C even in July. Rain showers common.',
    packingEssentials: ['Trekking boots (broken in)', 'Trekking poles', 'Sleeping bag (if camping)', 'Rain gear', 'Warm fleece + down jacket', 'Headlamp', 'Water purification tablets', 'Energy bars & trail mix', 'Blister kit', 'Wool socks (2-3 pairs)'],
    safetyTips: ['Hire a local porter/guide - trails aren\'t well marked', 'Start treks early morning', 'Carry at least 2L water per person', 'Don\'t attempt Base Camp if feeling altitude effects', 'Inform someone of your trekking plan', 'Jeep road is extreme - not for faint-hearted'],
    photography: ['Nanga Parbat golden hour (sunrise)', 'Milky Way from Fairy Meadows', 'Forest trail with light beams', 'Panoramic from Beyal Camp', 'Wildflowers in foreground with mountain backdrop'],
    emergencyInfo: 'No medical facilities at Fairy Meadows. Nearest: Chilas hospital (6+ hrs away). Carry comprehensive first aid. Helicopter rescue possible but expensive.',
  },
  'swat': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Mingora', desc: 'Drive via Motorway to Swat (5-6 hours). Stop at Takht-i-Bahi Buddhist ruins en route. Arrive Mingora, visit Swat Museum (Gandhara art collection). Evening stroll at Mingora Bazaar.', icon: 'car' },
      { day: 'Day 2', title: 'Malam Jabba & Fizagat', desc: 'Visit Malam Jabba ski resort - Pakistan\'s premier ski destination. Chair lift rides with panoramic views. Afternoon at Fizagat Park along Swat River. Visit Emerald mines area.', icon: 'mountain' },
      { day: 'Day 3', title: 'Madyan & Bahrain', desc: 'Drive to Madyan - charming riverside town. Continue to Bahrain, enjoy waterfall views and riverside walks. Local wood carving shopping. Fresh trout lunch.', icon: 'camera' },
      { day: 'Day 4', title: 'Kalam & Mahodand Lake', desc: 'Drive to Kalam Valley. Visit Ushu Forest (dense deodar). 4x4 to Mahodand Lake - alpine paradise surrounded by snow peaks. Horseback riding available. Return to Kalam.', icon: 'footprints' },
      { day: 'Day 5', title: 'Return to Islamabad', desc: 'Leisurely breakfast. Drive back via Chakdara. Stop at Churchill Picket viewpoint. Arrive Islamabad by evening.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'En-route restaurant', dinner: 'Mingora hotel - Peshawari cuisine' },
      { breakfast: 'Hotel buffet', lunch: 'Malam Jabba resort restaurant', dinner: 'Hotel BBQ dinner' },
      { breakfast: 'Hotel breakfast', lunch: 'Fresh trout at Bahrain riverside', dinner: 'Traditional Swati cuisine' },
      { breakfast: 'Hotel breakfast', lunch: 'Packed lunch for Mahodand', dinner: 'Kalam hotel farewell dinner' },
      { breakfast: 'Hotel breakfast', lunch: 'Roadside restaurant', dinner: 'Own arrangement' },
    ],
    accommodation: ['Swat Serena Hotel / Rock City Resort (Mingora)', 'Same hotel', 'PTDC Motel Kalam / Pine Park Hotel', 'Same hotel'],
    bestFor: ['Families with all ages', 'History & archaeology lovers', 'Skiing enthusiasts (winter)', 'Budget travelers', 'Short getaway seekers'],
    notRecommended: ['Those seeking extreme adventure', 'Peak summer (can be crowded)'],
    altitude: '980m (Mingora) to 3,200m (Mahodand Lake)',
    terrain: 'Well-paved roads mostly. 4x4 required for Mahodand Lake only.',
    fitnessLevel: 'Low - suitable for all fitness levels, minimal walking required',
    weather: 'Summer: 20-35°C (Mingora), cooler in Kalam. Winter: Snowfall, perfect for skiing.',
    packingEssentials: ['Light layers for summer', 'Camera', 'Comfortable shoes', 'Sunscreen', 'Swimwear (hotel pools)', 'Cash for local markets', 'Umbrella/rain jacket', 'Insect repellent'],
    safetyTips: ['Swat is very safe for tourists now', 'Bargain at local markets', 'Try fresh trout - it\'s the best!', 'Book Malam Jabba in advance during winter', 'Carry cash beyond Mingora'],
    photography: ['Malam Jabba panoramic views', 'Swat River golden hour', 'Mahodand Lake reflections', 'Buddhist ruins at Takht-i-Bahi', 'Local woodcarving artisans'],
    emergencyInfo: 'Saidu Teaching Hospital Mingora. Rescue 1122 active in Swat. Good mobile coverage throughout.',
  },
  'naran': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Naran', desc: 'Drive via Hazara Motorway to Balakot, then scenic Kaghan Valley road. Stop at Kawai waterfall and Paras village. Arrive Naran by afternoon. Evening walk along Kunhar River.', icon: 'car' },
      { day: 'Day 2', title: 'Lake Saif ul Malook', desc: 'Jeep ride to Lake Saif ul Malook (3,224m) - Pakistan\'s most famous alpine lake. Legend of Prince Saif & fairy Badri Jamala. Boat ride on crystal waters reflecting Malika Parbat. Horse riding available.', icon: 'mountain' },
      { day: 'Day 3', title: 'Lalazar & Lulusar Lake', desc: 'Morning visit to Lalazar Plateau - carpet of wildflowers with Malika Parbat backdrop. Afternoon drive to Lulusar Lake (3,410m) - serene alpine lake on way to Babusar Pass. Pristine and less crowded.', icon: 'camera' },
      { day: 'Day 4', title: 'Shogran & Siri Paye', desc: 'Drive to Shogran village (2,362m). Jeep ride to Siri Paye meadows (3,058m) - breathtaking 360° views of Makra Peak, Malika Parbat, and Musa ka Musalla. Paragliding available (seasonal). Return to Naran.', icon: 'footprints' },
      { day: 'Day 5', title: 'Return to Islamabad', desc: 'Leisure morning. Drive back through Kaghan Valley. Optional stop at Shogran viewpoint. Arrive Islamabad by evening.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'Roadside Balakot trout', dinner: 'Naran hotel - local cuisine' },
      { breakfast: 'Hotel breakfast', lunch: 'Packed for lake trip', dinner: 'Hotel BBQ with bonfire' },
      { breakfast: 'Hotel breakfast', lunch: 'Picnic at Lulusar', dinner: 'Naran bazaar restaurants - tikka, karahi' },
      { breakfast: 'Hotel breakfast', lunch: 'Shogran local food', dinner: 'Farewell dinner at hotel' },
      { breakfast: 'Hotel breakfast', lunch: 'En-route', dinner: 'Own arrangement' },
    ],
    accommodation: ['Pine Top Hotel / PTDC Naran', 'Same hotel', 'Same hotel', 'Same hotel'],
    bestFor: ['Families', 'First-time trekkers', 'Honeymooners', 'Photography enthusiasts', 'Lake lovers'],
    notRecommended: ['Off-season visitors (Oct-May - most places closed)', 'Those avoiding crowded tourist spots (peak July-Aug)'],
    altitude: '2,409m (Naran) to 3,410m (Lulusar Lake)',
    terrain: 'Main roads paved. Jeep tracks to lakes and meadows.',
    fitnessLevel: 'Low to Moderate - jeep does most work, short walks at viewpoints',
    weather: 'Summer (Jun-Sep): 10-25°C. Nights cold. Rain common in July-Aug monsoon.',
    packingEssentials: ['Warm jacket (essential even in summer)', 'Rain gear', 'Comfortable hiking shoes', 'Camera with wide-angle lens', 'Cash (limited ATMs)', 'Sunscreen & sunglasses', 'Snacks', 'Water bottle', 'Motion sickness pills (jeep rides are bumpy)'],
    safetyTips: ['Book jeeps through hotel for safety', 'Weather changes fast at lakes - carry rain gear always', 'Don\'t swim in alpine lakes (freezing)', 'Peak season = traffic jams - start early', 'Keep warm clothes handy even on sunny days'],
    photography: ['Saif ul Malook with Malika Parbat reflection', 'Lalazar wildflower meadows', 'Lulusar at sunrise', 'Siri Paye panoramic shot', 'Kunhar River long exposure at Naran'],
    emergencyInfo: 'THQ Hospital Naran (basic). Better facilities at Balakot & Mansehra. Rescue 1122 in Kaghan Valley.',
  },
  'chitral': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Dir → Chitral', desc: 'Fly to Chitral (35 min) or drive via Dir-Lowari Tunnel (10-12 hrs). If driving, stop at Dir for lunch. Cross the Lowari Tunnel (longest road tunnel in Pakistan at 8.5 km). Arrive Chitral by evening. Visit Shahi Mosque near the river.', icon: 'car' },
      { day: 'Day 2', title: 'Chitral Town & Fort', desc: 'Explore Chitral Fort (Shahi Qila) - residence of Mehtar of Chitral. Visit Chitral Museum showcasing Kalash artifacts & polo heritage. Walk through the vibrant Chitral Bazaar for gemstones, Chitrali topi & patti. Afternoon visit to Garam Chashma hot springs (90 min drive).', icon: 'camera' },
      { day: 'Day 3', title: 'Kalash Valley - Bumburet', desc: 'Drive to Bumburet Valley (2 hrs) - largest of three Kalash valleys. Meet the Kalash people - one of the world\'s most unique indigenous communities. Visit Kalash graveyard, wooden effigies (gandau), and Jestak Han (temple). Witness traditional dances if festival season. Overnight in Kalash guesthouse.', icon: 'footprints' },
      { day: 'Day 4', title: 'Rumbur & Birir Valleys', desc: 'Visit Rumbur Valley - quieter, more traditional. Trek between villages through walnut orchards. Continue to Birir Valley - the least visited, most authentic. Traditional Kalash woodcarving workshops. Evening bonfire with Kalash elders sharing folklore.', icon: 'mountain' },
      { day: 'Day 5', title: 'Shandur Pass (Optional)', desc: 'Full day excursion to Shandur Pass (3,734m) - "Roof of the World Polo Ground." Site of the famous Shandur Polo Festival (July). Vast open plateau with panoramic views. Picnic at Shandur Lake. Return to Chitral.', icon: 'sunrise' },
      { day: 'Day 6', title: 'Return Journey', desc: 'Morning free for souvenir shopping - Chitrali woolen products, gemstones. Depart via Lowari Tunnel or flight to Islamabad. Tour ends with cultural enrichment.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'Dir roadside / flight snack', dinner: 'Chitrali cuisine - shapik (bread), meat stew' },
      { breakfast: 'Hotel Chitrali breakfast', lunch: 'Local restaurant near fort', dinner: 'Garam Chashma trout dinner' },
      { breakfast: 'Simple Kalash breakfast', lunch: 'Home-cooked Kalash meal', dinner: 'Traditional Kalash feast - goat meat, walnuts, local bread' },
      { breakfast: 'Guesthouse breakfast', lunch: 'Packed lunch for valley trek', dinner: 'Chitral hotel restaurant' },
      { breakfast: 'Early packed breakfast', lunch: 'Picnic at Shandur', dinner: 'Hotel farewell dinner' },
      { breakfast: 'Hotel breakfast', lunch: 'En-route / flight', dinner: 'Own arrangement' },
    ],
    accommodation: ['Chitral Fort Hotel / Hindukush Heights', 'Same hotel', 'Kalash Guesthouse (basic but authentic)', 'Chitral hotel', 'Same hotel'],
    bestFor: ['Cultural explorers', 'Anthropology enthusiasts', 'Polo lovers (July festival)', 'Off-beat travelers', 'Photographers documenting indigenous cultures'],
    notRecommended: ['Those expecting luxury accommodation', 'Winter travelers (roads close Nov-Apr)', 'Very tight schedules (remote area)'],
    altitude: '1,500m (Chitral) to 3,734m (Shandur Pass)',
    terrain: 'Paved roads to Chitral, rough jeep tracks to Kalash valleys. Lowari Tunnel well-maintained.',
    fitnessLevel: 'Low to Moderate - mostly vehicle travel, light walking in valleys',
    weather: 'Summer (May-Sep): 20-35°C in Chitral, cooler in valleys. Winter: Heavy snowfall, many roads closed.',
    packingEssentials: ['Modest clothing (conservative area except Kalash)', 'Camera with extra storage', 'Cash (no ATMs in Kalash)', 'Warm layers for Shandur', 'Comfortable walking shoes', 'Gifts for Kalash hosts (optional - school supplies appreciated)', 'Sunscreen', 'Insect repellent', 'Torch/headlamp'],
    safetyTips: ['Ask permission before photographing Kalash people', 'Respect Kalash customs - don\'t touch altars', 'Women should not enter Bashali (birthing house)', 'Bargain respectfully in bazaars', 'Carry enough cash for entire trip', 'Keep copies of ID documents'],
    photography: ['Kalash women in traditional dress', 'Bumburet Valley panoramic views', 'Chitral Fort with mountain backdrop', 'Shandur Polo ground', 'Garam Chashma steam rising', 'Wooden Kalash effigies (gandau)'],
    emergencyInfo: 'DHQ Hospital Chitral. Army Medical Corps accessible. No facilities in Kalash valleys - carry first aid. Helicopter evacuation possible in emergencies.',
  },
  'kumrat': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Dir → Thal', desc: 'Drive via Motorway to Dir (7-8 hrs). Continue to Thal village, gateway to Kumrat. Check into guesthouse. Evening walk along Panjkora River with stunning sunset views.', icon: 'car' },
      { day: 'Day 2', title: 'Kumrat Valley & Jahaz Banda', desc: 'Jeep ride into Kumrat Valley (2 hrs on rough track). Visit Kumrat Forest - massive deodar and pine trees, some centuries old. Continue to Jahaz Banda meadow (3,500m) - "Ship-shaped meadow." 360° views of snow peaks. Photography paradise. Picnic lunch in meadow.', icon: 'mountain' },
      { day: 'Day 3', title: 'Do Kala Chashma & Waterfall', desc: 'Trek to Do Kala Chashma - twin black springs emerging from mountain. Visit Kumrat Waterfall cascading through dense forest. Afternoon at leisure in the valley. Optional fishing in Panjkora River (trout). Campfire evening.', icon: 'footprints' },
      { day: 'Day 4', title: 'Katora Lake Trek', desc: 'Full day trek/jeep to Katora Lake (3,700m) - a stunning alpine lake surrounded by snow peaks. Crystal clear waters reflecting mountains. Challenging but incredibly rewarding. Pack warm clothes - temperature drops significantly. Return to Thal.', icon: 'sunrise' },
      { day: 'Day 5', title: 'Return to Islamabad', desc: 'Morning at leisure. Drive back through Dir to Islamabad. Arrive by evening.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'Roadside restaurant Dir', dinner: 'Thal guesthouse - local Pashtun cuisine' },
      { breakfast: 'Guesthouse breakfast', lunch: 'Picnic at Jahaz Banda', dinner: 'Camp-style BBQ dinner' },
      { breakfast: 'Guesthouse breakfast', lunch: 'Packed lunch for trek', dinner: 'Fresh trout dinner' },
      { breakfast: 'Early packed breakfast', lunch: 'Packed for Katora trek', dinner: 'Guesthouse farewell dinner' },
      { breakfast: 'Guesthouse breakfast', lunch: 'En-route', dinner: 'Own arrangement' },
    ],
    accommodation: ['Thal guesthouse / camping', 'Forest lodge / camping tents', 'Same accommodation', 'Thal guesthouse'],
    bestFor: ['Adventure seekers', 'Nature photographers', 'Trekking enthusiasts', 'Those escaping crowds', 'Wilderness lovers'],
    notRecommended: ['Luxury seekers (very basic facilities)', 'Those unable to handle rough jeep rides', 'Winter visitors (Nov-Apr inaccessible)', 'Young children under 8'],
    altitude: '2,000m (Thal) to 3,700m (Katora Lake)',
    terrain: 'Very rough jeep tracks, forest trails, steep trekking paths. 4x4 mandatory.',
    fitnessLevel: 'Moderate to High - Katora Lake trek is demanding, other areas moderate',
    weather: 'Summer (Jun-Sep): 15-28°C daytime, 5-10°C nights. Rain common in July-Aug monsoon.',
    packingEssentials: ['Sturdy trekking boots', 'Warm layers + down jacket', 'Rain gear (essential)', 'Sleeping bag', 'Trekking poles', 'Water purification', 'Energy food', 'First aid kit', 'Torch/headlamp', 'Cash only (no ATMs/signals)'],
    safetyTips: ['No mobile network - inform family before entering', 'Hire local guide - trails unmarked', 'Start treks by 7am', 'River crossings can be dangerous after rain', 'Bear awareness - make noise while trekking', 'Carry water purification tablets'],
    photography: ['Jahaz Banda meadow panorama', 'Kumrat forest light rays through trees', 'Katora Lake reflection shots', 'Do Kala Chashma springs', 'Panjkora River long exposure', 'Milky Way from campsite'],
    emergencyInfo: 'No medical facilities in Kumrat. Nearest hospital in Dir (3-4 hrs). Carry comprehensive first aid. No phone signal - satellite phone recommended.',
  },
  'neelum': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Muzaffarabad → Keran', desc: 'Drive to Muzaffarabad (4 hrs). Continue along Neelum River on the stunning Neelum Valley road. Stop at Dhani waterfall. Arrive Keran - a village on the LoC with views of Indian-administered Kashmir across the river. Overnight at Keran.', icon: 'car' },
      { day: 'Day 2', title: 'Keran → Sharda', desc: 'Drive deeper into Neelum Valley to Sharda (2 hrs). Visit Sharda University ruins - ancient Buddhist/Hindu seat of learning (5th century). Sharda Peeth temple ruins. Walk through the peaceful village. Stunning Neelum River views throughout.', icon: 'camera' },
      { day: 'Day 3', title: 'Kel & Arang Kel', desc: 'Drive to Kel village (2 hrs from Sharda). From Kel, trek or take chairlift to Arang Kel - the "Pearl of Neelum Valley" (2,500m). Breathtaking views of the valley below. Lush green meadows, wooden houses, and misty mountains. Overnight at Arang Kel guesthouse.', icon: 'footprints' },
      { day: 'Day 4', title: 'Ratti Gali Lake', desc: 'Early morning trek/horse ride to Ratti Gali Lake (3,700m) - the "Jewel of Neelum." Alpine lake fed by glaciers, surrounded by snow-capped peaks. 4-5 hr round trip trek from Dowarian. One of Pakistan\'s most beautiful lakes. Return to Kel.', icon: 'mountain' },
      { day: 'Day 5', title: 'Return to Islamabad', desc: 'Begin return journey through the valley. Lunch stop at Athmuqam. Drive through Muzaffarabad to Islamabad. Arrive by late evening.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'En-route at Muzaffarabad', dinner: 'Keran guesthouse - Kashmiri cuisine' },
      { breakfast: 'Guesthouse breakfast', lunch: 'Sharda local restaurant', dinner: 'Traditional Kashmiri rogan josh, naan' },
      { breakfast: 'Guesthouse Kashmiri chai', lunch: 'Arang Kel home-cooked meal', dinner: 'Guesthouse dinner with valley views' },
      { breakfast: 'Early packed breakfast', lunch: 'Packed for Ratti Gali trek', dinner: 'Kel guesthouse farewell dinner' },
      { breakfast: 'Guesthouse breakfast', lunch: 'Athmuqam restaurant', dinner: 'Own arrangement in Islamabad' },
    ],
    accommodation: ['Keran guesthouse / AJKT motel', 'Sharda Rest House', 'Arang Kel wooden guesthouse (basic but magical)', 'Kel guesthouse'],
    bestFor: ['Romantic getaways', 'Trekking enthusiasts', 'Those seeking pristine nature', 'Lake lovers', 'Cultural history buffs'],
    notRecommended: ['Luxury seekers (basic accommodation)', 'Those with vertigo (narrow valley roads)', 'Winter visitors (heavy snow Oct-Apr)', 'People unable to trek (Ratti Gali requires 5+ hrs)'],
    altitude: '1,400m (Keran) to 3,700m (Ratti Gali Lake)',
    terrain: 'Narrow valley road (well-paved). Trekking trails moderate to challenging. Chairlift at Arang Kel.',
    fitnessLevel: 'Moderate to High - Ratti Gali trek is demanding; Arang Kel has chairlift option',
    weather: 'Summer (Jun-Sep): 15-30°C. Monsoon rains Jul-Aug. Autumn: Stunning foliage. Winter: Heavy snowfall.',
    packingEssentials: ['Trekking boots', 'Warm layers (cold at altitude)', 'Rain jacket', 'Camera with spare batteries', 'Cash (limited ATMs)', 'Snacks for treks', 'Water bottle & purification', 'Torch', 'First aid basics', 'Sunscreen'],
    safetyTips: ['Stay on marked trails near LoC', 'Don\'t photograph military installations', 'Roads can be blocked by landslides - keep flexible schedule', 'Horse riding recommended for Ratti Gali if not fit enough', 'Carry ID at all times - multiple checkpoints', 'Book guesthouses in advance in peak season'],
    photography: ['Arang Kel aerial view from above', 'Ratti Gali Lake glacial waters', 'Neelum River turquoise bends', 'Sharda ruins in golden light', 'Misty valley mornings from Arang Kel', 'Night sky from Kel village'],
    emergencyInfo: 'Basic medical at Athmuqam hospital. Military assistance available. Limited mobile coverage beyond Kel. Carry first aid for remote areas.',
  },
  'deosai': {
    itinerary: [
      { day: 'Day 1', title: 'Skardu → Deosai Entry', desc: 'From Skardu, drive to Deosai National Park via Sadpara road (2-3 hrs by 4x4). Enter the "Land of Giants" - second highest plateau in the world (avg 4,114m). Vast rolling grasslands stretching to horizon. Set up camp near Bara Pani.', icon: 'car' },
      { day: 'Day 2', title: 'Sheosar Lake & Wildlife', desc: 'Drive across the plateau to Sheosar Lake - one of the highest lakes in the world. Crystal clear waters reflecting snow peaks. Spot Himalayan brown bears, golden marmots, Tibetan red fox. Visit Kala Pani springs. Wildflower carpets in July-August.', icon: 'mountain' },
      { day: 'Day 3', title: 'Exploration & Return', desc: 'Morning wildlife spotting (brown bears most active at dawn). Visit remote corners of the plateau. Begin return to Skardu by afternoon. Stop at Sadpara Lake en route. Evening in Skardu.', icon: 'sunrise' },
    ],
    meals: [
      { breakfast: 'Packed from Skardu', lunch: 'Packed picnic on the plateau', dinner: 'Camp dinner - warm soup, dal, rice' },
      { breakfast: 'Camp breakfast with chai', lunch: 'Picnic at Sheosar Lake', dinner: 'Camp BBQ dinner under stars' },
      { breakfast: 'Camp breakfast', lunch: 'Packed for return journey', dinner: 'Skardu hotel restaurant' },
    ],
    accommodation: ['Camping at Bara Pani (tents provided)', 'Camping near Sheosar Lake'],
    bestFor: ['Wildlife photographers', 'Adventure seekers', 'Astrophotography enthusiasts', 'Those seeking extreme solitude', 'Nature scientists & researchers'],
    notRecommended: ['People with heart/respiratory conditions (4,100m+ altitude)', 'Those expecting any facilities', 'Comfort seekers', 'Children under 10', 'Anyone without proper cold gear'],
    altitude: '4,114m average - one of the highest plateaus on Earth',
    terrain: 'Rough 4x4 tracks across open plateau. No paved roads inside the park.',
    fitnessLevel: 'Moderate - minimal walking but extreme altitude requires acclimatization',
    weather: 'Open only Jun-Sep. Even in summer: 0-15°C daytime, well below 0°C at night. Snow possible any time. Wind chill extreme.',
    packingEssentials: ['Heavy winter gear (down jacket mandatory)', 'Thermal base layers', 'Sleeping bag rated -10°C', 'Altitude medicine (Diamox)', 'Binoculars for wildlife', 'Camera with telephoto lens', 'Sunscreen SPF 50+', 'Lip balm', 'Wind-proof outer layer', 'Hot water thermos', 'Emergency blanket', 'Snacks & energy food'],
    safetyTips: ['Acclimatize in Skardu 1-2 days before Deosai', 'Never approach brown bears - maintain 100m distance', 'Weather changes in minutes - always carry warm layers', 'No mobile signal anywhere on plateau', 'Travel with experienced guide only', 'Carry all food & water - no shops', 'Vehicle must be 4x4 in good condition'],
    photography: ['Himalayan brown bear in meadow', 'Sheosar Lake at sunrise with snow peaks', 'Wildflower macro shots (July-Aug)', 'Milky Way - one of the darkest skies on Earth', 'Golden marmots standing alert', 'Vast plateau panorama with storm clouds'],
    emergencyInfo: 'NO medical facilities on Deosai. Nearest hospital: Skardu (3+ hrs). Carry comprehensive first aid & emergency supplies. Satellite phone essential. Park rangers station at entry point.',
  },
  'murree': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Murree', desc: 'Short scenic drive from Islamabad (1.5 hrs). Check into hotel. Stroll along the famous Mall Road - colonial-era promenade with shops, cafes & stunning valley views. Visit Pindi Point for panoramic views of Islamabad. Evening shopping for local handicrafts.', icon: 'car' },
      { day: 'Day 2', title: 'Kashmir Point & Patriata', desc: 'Morning visit to Kashmir Point - views of snow-capped Kashmir mountains on clear days. Drive to Patriata (New Murree) - chairlift & cable car rides through pine forests. Lunch at hilltop restaurant. Afternoon at Ayubia National Park - short nature trails through deodar forests. Spot monkeys, leopards (rare), birds.', icon: 'mountain' },
      { day: 'Day 3', title: 'Nathia Gali & Return', desc: 'Drive to nearby Nathia Gali (30 min). Optional trek to Mushkpuri Top (2,800m) - 2-3 hr round trip with stunning views. Walk the Pipeline Track through moss-covered forest. Return to Islamabad by afternoon.', icon: 'footprints' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'Mall Road restaurant - local Pakistani', dinner: 'Hotel dinner - Continental/Pakistani' },
      { breakfast: 'Hotel breakfast', lunch: 'Patriata hilltop café', dinner: 'Mall Road BBQ restaurant' },
      { breakfast: 'Hotel breakfast', lunch: 'Nathia Gali local dhaba', dinner: 'Own arrangement in Islamabad' },
    ],
    accommodation: ['Pearl Continental / Lockwood Hotel / Cecil Hotel Murree', 'Same hotel'],
    bestFor: ['Families with children of all ages', 'Weekend getaway from Islamabad', 'First-time hill station visitors', 'Budget travelers', 'Senior citizens'],
    notRecommended: ['Those seeking remote wilderness', 'Peak summer weekends (extremely crowded)', 'Adventure seekers wanting extreme activities'],
    altitude: '2,291m (Murree) - pleasant hill station elevation',
    terrain: 'Well-paved roads throughout. Easy walking paths. Chairlifts available.',
    fitnessLevel: 'Low - suitable for all ages and fitness levels',
    weather: 'Summer (May-Sep): 15-25°C, pleasant escape from plains heat. Monsoon rains Jul-Aug. Winter: Snowfall Dec-Feb, magical but cold (-5 to 5°C).',
    packingEssentials: ['Light layers for summer', 'Umbrella/rain jacket (rain common)', 'Comfortable walking shoes', 'Camera', 'Cash & cards accepted', 'Sunscreen', 'Light sweater for evenings'],
    safetyTips: ['Avoid driving on foggy days', 'Mall Road gets crowded - keep belongings safe', 'Weekdays are much less crowded than weekends', 'Book hotel in advance during snow season', 'Monkey areas - keep food hidden', 'Road to Nathia Gali has sharp turns - drive carefully'],
    photography: ['Mall Road at night with lights', 'Sunset from Pindi Point', 'Snow-covered pines in winter', 'Chairlift through clouds at Patriata', 'Kashmir mountains from Kashmir Point', 'Pipeline Track forest paths'],
    emergencyInfo: 'CMH Murree & multiple private clinics available. Full mobile coverage. Close to Islamabad for any emergency (1.5 hrs). Rescue 1122 active.',
  },
  'nathia gali': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Nathia Gali', desc: 'Drive via Murree to Nathia Gali (2.5 hrs). Check into hotel/guesthouse surrounded by pine & oak forests. Afternoon walk through the peaceful town. Visit St. Matthew\'s Church (colonial era). Evening at Ayubia National Park entry - spot monkeys and birds.', icon: 'car' },
      { day: 'Day 2', title: 'Mushkpuri Top & Pipeline Track', desc: 'Early morning trek to Mushkpuri Top (2,800m) - moderate 2-3 hr climb through dense forest. Panoramic 360° views from summit - Nanga Parbat visible on clear days. Descend and walk the famous Pipeline Track - 5km easy trail through moss-covered ancient forest. Magical light filtering through canopy.', icon: 'footprints' },
      { day: 'Day 3', title: 'Miranjani & Return', desc: 'Optional trek to Miranjani Top (2,992m) - highest peak in Galyat range (3-4 hrs round trip). More challenging but rewarding views. Alternatively, explore Dungagali & surrounding trails. Return to Islamabad by afternoon.', icon: 'mountain' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'Local restaurant', dinner: 'Hotel/guesthouse dinner - traditional' },
      { breakfast: 'Early packed breakfast for trek', lunch: 'Packed lunch at summit', dinner: 'Hotel restaurant' },
      { breakfast: 'Hotel breakfast', lunch: 'En-route restaurant', dinner: 'Own arrangement' },
    ],
    accommodation: ['Green Spot Hotel / Pine Track Lodge Nathia Gali', 'Same accommodation'],
    bestFor: ['Trekking beginners', 'Nature lovers', 'Bird watchers', 'Weekend hikers from Islamabad', 'Forest therapy seekers'],
    notRecommended: ['Those expecting nightlife or entertainment', 'Extreme adventure seekers', 'Very crowded weekends in summer'],
    altitude: '2,500m (Nathia Gali) to 2,992m (Miranjani Top)',
    terrain: 'Well-marked forest trails. Some steep sections on Mushkpuri & Miranjani.',
    fitnessLevel: 'Moderate - summit treks require reasonable fitness, Pipeline Track is easy',
    weather: 'Summer: 12-22°C, frequent mist & light rain. Winter: Snow, -5 to 5°C. Best months: May-Jun, Sep-Oct.',
    packingEssentials: ['Trekking shoes (trails can be muddy)', 'Rain jacket (mist/rain common)', 'Warm layers', 'Walking stick/trekking poles', 'Camera', 'Water bottle', 'Snacks', 'Insect repellent', 'Light backpack'],
    safetyTips: ['Start Mushkpuri trek early to avoid afternoon clouds', 'Pipeline Track gets slippery in rain - walk carefully', 'Carry water - no shops on trails', 'Stay on marked paths', 'Weather changes quickly - carry rain gear always', 'Monkey encounters - don\'t feed or tease them'],
    photography: ['Pipeline Track forest with light beams', 'Mushkpuri Top sunrise panorama', 'Moss-covered trees close-up', 'Cloud inversion from summit', 'Colonial-era church', 'Wildflowers along trails (spring)'],
    emergencyInfo: 'Basic medical at Nathia Gali. Murree hospital 30 min away. Full mobile coverage. Close to Islamabad for emergencies.',
  },
  'gilgit': {
    itinerary: [
      { day: 'Day 1', title: 'Islamabad → Gilgit', desc: 'Fly to Gilgit (1 hr - weather dependent, spectacular flight over mountains) or drive via KKH (15-18 hrs). Arrive and check into hotel. Evening walk along Gilgit River. Visit Gilgit Bazaar for dried fruits and gemstones.', icon: 'car' },
      { day: 'Day 2', title: 'Kargah Buddha & Gilgit Valley', desc: 'Visit Kargah Buddha - ancient rock carving of standing Buddha (7th century). Drive to Kargah Nala for hiking. Visit Gilgit Monument and explore the town\'s rich multicultural heritage. Afternoon visit to Danyore for polo ground - traditional free-style polo (if match day).', icon: 'camera' },
      { day: 'Day 3', title: 'Naltar Valley', desc: 'Full day trip to Naltar Valley (2.5 hrs from Gilgit). Visit the stunning three-colored Naltar Lakes - Satrangi (seven-colored) and Pari (fairy) lakes. Pine forests and ski slopes. Optional skiing in winter. Pristine alpine beauty with few tourists. Return to Gilgit.', icon: 'mountain' },
      { day: 'Day 4', title: 'Phander Lake / Return', desc: 'Optional day trip to Phander Lake (4 hrs one way) - turquoise waters in a remote valley. Or explore local villages, interact with Shina-speaking locals. Prepare for return journey/flight. Farewell dinner.', icon: 'sunrise' },
      { day: 'Day 5', title: 'Return to Islamabad', desc: 'Flight or drive back to Islamabad. Tour concludes.', icon: 'car' },
    ],
    meals: [
      { breakfast: 'Hotel breakfast', lunch: 'Gilgit restaurant', dinner: 'Hotel restaurant - Gilgiti cuisine, chapshoro' },
      { breakfast: 'Hotel breakfast', lunch: 'Local restaurant near Kargah', dinner: 'Gilgit Bazaar street food experience' },
      { breakfast: 'Hotel breakfast', lunch: 'Picnic at Naltar Lake', dinner: 'Hotel special dinner' },
      { breakfast: 'Hotel breakfast', lunch: 'Packed / local', dinner: 'Farewell dinner - traditional feast' },
      { breakfast: 'Hotel/packed breakfast', lunch: 'En-route or flight', dinner: 'Own arrangement' },
    ],
    accommodation: ['Serena Gilgit / Gateway Hotel', 'Same hotel', 'Same hotel', 'Same hotel'],
    bestFor: ['Polo enthusiasts', 'History & archaeology buffs', 'Lake lovers', 'Off-season skiers (Naltar)', 'Cultural travelers'],
    notRecommended: ['Those on very tight schedules (flights often cancelled)', 'Luxury seekers beyond Gilgit town', 'Winter road travelers (KKH often blocked)'],
    altitude: '1,500m (Gilgit) to 3,200m (Naltar Lakes)',
    terrain: 'Paved roads in Gilgit. Rough jeep track to Naltar Valley.',
    fitnessLevel: 'Low to Moderate - mostly vehicle travel with short walks',
    weather: 'Summer: 20-38°C (hot in Gilgit town). Naltar Valley cooler at altitude. Winter: -5 to 10°C, snow at Naltar.',
    packingEssentials: ['Light clothes for Gilgit (hot summers)', 'Warm layers for Naltar', 'Camera with telephoto lens', 'Cash (limited ATMs)', 'Sunscreen & hat', 'Water bottle', 'Flexible travel plans (flights weather-dependent)', 'Comfortable shoes'],
    safetyTips: ['Book return flight backup plan (flights often cancel)', 'Carry cash - ATMs can be unreliable', 'Naltar road is narrow - experienced driver needed', 'Drink bottled water', 'Respect local customs', 'Check road conditions before long drives'],
    photography: ['Naltar Lakes - three different colors', 'Kargah Buddha rock carving', 'Free-style polo match action shots', 'Gilgit River sunset', 'Pine forest at Naltar', 'Mountain panoramas from Naltar'],
    emergencyInfo: 'Combined Military Hospital (CMH) Gilgit. Aga Khan Hospital Gilgit. Good medical facilities in town. Rescue 1122 active. Mobile coverage in Gilgit, limited in Naltar.',
  },
};

// Default meta for tours without specific data
const defaultMeta = {
  itinerary: [
    { day: 'Day 1', title: 'Arrival & Welcome', desc: 'Arrive at the destination. Check into your accommodation. Welcome briefing by your tour guide covering the full itinerary, safety guidelines, and local customs. Evening free for exploration of the local area. Welcome dinner with traditional cuisine.', icon: 'car' as const },
    { day: 'Day 2', title: 'Full Day Exploration', desc: 'After a hearty breakfast, embark on a full-day guided tour of the main attractions. Visit iconic landmarks, scenic viewpoints, and cultural sites. Packed lunch included. Return to hotel by evening for rest and dinner.', icon: 'camera' as const },
    { day: 'Day 3', title: 'Adventure & Activities', desc: 'Optional adventure activities available - hiking, boat rides, or cultural workshops depending on the destination. Explore off-the-beaten-path locations recommended by local guides. Evening cultural experience or bonfire.', icon: 'footprints' as const },
    { day: 'Day 4', title: 'Departure', desc: 'Leisure morning with optional sunrise viewpoint visit. Pack up, checkout, and begin return journey with stops at scenic points along the way. Tour concludes with drop-off at starting point.', icon: 'car' as const },
  ],
  meals: [
    { breakfast: 'Hotel breakfast buffet', lunch: 'Local restaurant', dinner: 'Welcome dinner - traditional cuisine' },
    { breakfast: 'Hotel breakfast', lunch: 'Packed lunch for excursion', dinner: 'Hotel restaurant' },
    { breakfast: 'Hotel breakfast', lunch: 'Local cuisine experience', dinner: 'Special farewell dinner' },
    { breakfast: 'Hotel breakfast', lunch: 'En-route restaurant', dinner: 'Own arrangement' },
  ],
  accommodation: ['Quality hotel / resort at destination', 'Same accommodation', 'Same accommodation'],
  bestFor: ['Families', 'Couples', 'Photography enthusiasts', 'Nature lovers'],
  notRecommended: ['Those with severe mobility issues on mountain tours'],
  altitude: 'Varies by destination - details provided at booking',
  terrain: 'Mix of paved roads and natural trails',
  fitnessLevel: 'Low to Moderate - suitable for most fitness levels',
  weather: 'Check seasonal guide for your specific travel dates',
  packingEssentials: ['Comfortable walking shoes', 'Weather-appropriate layers', 'Sunscreen & sunglasses', 'Camera', 'Personal medications', 'Cash (ATMs limited in remote areas)', 'Water bottle', 'Rain jacket', 'Power bank'],
  safetyTips: ['Follow guide instructions at all times', 'Stay hydrated', 'Carry ID at all times', 'Inform guide of any medical conditions', 'Respect local customs & dress modestly'],
  photography: ['Sunrise & sunset golden hours', 'Landscape panoramas', 'Local culture & people (with permission)', 'Flora & fauna close-ups'],
  emergencyInfo: 'Emergency contacts provided at briefing. Guide carries first aid kit & satellite communication for remote areas.',
};

function getMetaKey(title: string): string | undefined {
  const lower = title.toLowerCase();
  return Object.keys(tourMeta).find(k => lower.includes(k));
}

const difficultyConfig: Record<string, { color: string; level: number; label: string; desc: string }> = {
  'Easy': { color: 'text-green-600', level: 25, label: '● Easy', desc: 'Suitable for all ages & fitness levels. Minimal physical activity required.' },
  'Moderate': { color: 'text-yellow-600', level: 50, label: '●● Moderate', desc: 'Some hiking & altitude. Basic fitness recommended. Suitable for most adults.' },
  'Challenging': { color: 'text-orange-600', level: 75, label: '●●● Challenging', desc: 'Significant trekking, high altitude. Good fitness required. Prior trekking experience helpful.' },
  'Extreme': { color: 'text-red-600', level: 100, label: '●●●● Extreme', desc: 'Technical terrain, very high altitude. Excellent fitness mandatory. Experience required.' },
};

const iconMap = {
  sunrise: Sunrise,
  mountain: Mountain,
  camera: Camera,
  car: Car,
  footprints: Footprints,
  sunset: Sunset,
  moon: Moon,
};

interface Props {
  tour: Tour | null;
  onClose: () => void;
}

export default function TourDetailDialog({ tour, onClose }: Props) {
  const { format } = useCurrency();
  const [destInfo, setDestInfo] = useState<DestInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tour) return;
    // Try to load destination info
    if (tour.hotel_id || tour.title) {
      setLoading(true);
      supabase.from('tours').select('destination_id').eq('id', tour.id).single().then(({ data }) => {
        if (data?.destination_id) {
          supabase.from('destinations').select('name, location, best_time, highlights').eq('id', data.destination_id).single().then(({ data: dest }) => {
            if (dest) setDestInfo(dest);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [tour]);

  if (!tour) return null;

  const metaKey = getMetaKey(tour.title);
  const meta = metaKey ? tourMeta[metaKey] : defaultMeta;
  const diffConfig = difficultyConfig[tour.difficulty || 'Moderate'] || difficultyConfig['Moderate'];
  const price = tour.discount_price || tour.price;
  const groupSize = tour.max_group_size || 10;
  const groupPrice = Math.round(price * groupSize * 0.85);

  return (
    <Dialog open={!!tour} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{tour.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Hero Image */}
          <div className="relative rounded-xl overflow-hidden">
            <img src={getTourImage(tour.title, tour.image_url)} alt={tour.title} className="w-full h-52 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-2">
              {tour.difficulty && <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{tour.difficulty}</span>}
              {tour.is_featured && <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center gap-1"><Star className="w-3 h-3" />Featured</span>}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tour.duration && (
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold text-foreground">{tour.duration}</p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Group Size</p>
              <p className="text-sm font-semibold text-foreground">Max {groupSize}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Mountain className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Altitude</p>
              <p className="text-sm font-semibold text-foreground truncate">{meta.altitude.split(' ')[0]}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Compass className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Terrain</p>
              <p className="text-sm font-semibold text-foreground truncate">{meta.terrain.split('.')[0]}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Per Person</span>
              </div>
              <p className="text-lg font-bold text-primary">{format(price)}</p>
              {tour.discount_price && <p className="text-xs text-muted-foreground line-through">{format(tour.price)}</p>}
            </div>
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Group ({groupSize} pax)</span>
              </div>
              <p className="text-lg font-bold text-accent">{format(groupPrice)}</p>
              <p className="text-xs text-muted-foreground">15% group discount</p>
            </div>
          </div>

          {tour.description && <p className="text-sm text-muted-foreground leading-relaxed">{tour.description}</p>}

          {/* Difficulty Rating */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Difficulty Rating
              </p>
              <span className={`text-sm font-bold ${diffConfig.color}`}>{diffConfig.label}</span>
            </div>
            <Progress value={diffConfig.level} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">{diffConfig.desc}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Fitness:</span> <span className="text-foreground font-medium">{meta.fitnessLevel.split(' - ')[0]}</span></div>
              <div><span className="text-muted-foreground">Altitude:</span> <span className="text-foreground font-medium">{meta.altitude.split(' - ')[0]}</span></div>
            </div>
          </div>

          {/* Detailed Itinerary */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Map className="w-4 h-4 text-primary" /> Day-by-Day Itinerary
            </p>
            <div className="space-y-3">
              {meta.itinerary.map((item, i) => {
                const Icon = iconMap[item.icon] || Sunrise;
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{item.day}</span>
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meals */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" /> Meals Plan
            </p>
            <div className="space-y-2">
              {meta.meals.map((meal, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/20 border border-border/20">
                  <p className="text-xs font-bold text-primary mb-1.5">Day {i + 1}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-muted-foreground mb-0.5">🌅 Breakfast</p><p className="text-foreground">{meal.breakfast}</p></div>
                    <div><p className="text-muted-foreground mb-0.5">☀️ Lunch</p><p className="text-foreground">{meal.lunch}</p></div>
                    <div><p className="text-muted-foreground mb-0.5">🌙 Dinner</p><p className="text-foreground">{meal.dinner}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Hotel className="w-4 h-4 text-primary" /> Accommodation Details
            </p>
            <div className="space-y-1.5">
              {meta.accommodation.map((acc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/5">
                  <Moon className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Night {i + 1}:</span>
                  <span className="text-foreground font-medium">{acc}</span>
                </div>
              ))}
            </div>
            {tour.hotels && (
              <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">Primary Hotel</p>
                <p className="text-sm font-medium text-foreground">{tour.hotels.name}</p>
                {tour.hotels.star_rating && <div className="flex gap-0.5 mt-1">{Array.from({ length: tour.hotels.star_rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}</div>}
              </div>
            )}
          </div>

          {/* What's Included */}
          {tour.includes && tour.includes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> What's Included
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {tour.includes.map(inc => (
                  <div key={inc} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-green-500/5">
                    <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best For / Not Recommended */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-green-600" /> Best For
              </p>
              <div className="space-y-1">
                {meta.bestFor.map(item => (
                  <p key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-green-600 mt-0.5">✓</span> {item}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-orange-500" /> Not Recommended
              </p>
              <div className="space-y-1">
                {meta.notRecommended.map(item => (
                  <p key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-orange-500 mt-0.5">✗</span> {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Weather & Packing */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-primary" /> Weather & Climate
            </p>
            <p className="text-xs text-muted-foreground mb-3">{meta.weather}</p>
            
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Backpack className="w-4 h-4 text-primary" /> Packing Essentials
            </p>
            <div className="flex flex-wrap gap-1.5">
              {meta.packingEssentials.map(item => (
                <span key={item} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{item}</span>
              ))}
            </div>
          </div>

          {/* Safety & Photography Tips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-red-500" /> Safety Tips
              </p>
              <div className="space-y-1">
                {meta.safetyTips.slice(0, 4).map(tip => (
                  <p key={tip} className="text-[11px] text-muted-foreground">• {tip}</p>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-blue-500" /> Photo Spots
              </p>
              <div className="space-y-1">
                {meta.photography.slice(0, 4).map(spot => (
                  <p key={spot} className="text-[11px] text-muted-foreground">📸 {spot}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
            <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-destructive" /> Emergency Information
            </p>
            <p className="text-[11px] text-muted-foreground">{meta.emergencyInfo}</p>
          </div>

          {/* Destination Info */}
          {destInfo && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" /> Destination: {destInfo.name}
              </p>
              {destInfo.location && <p className="text-[11px] text-muted-foreground">📍 {destInfo.location}</p>}
              {destInfo.best_time && <p className="text-[11px] text-muted-foreground">🕐 Best time: {destInfo.best_time}</p>}
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2 pt-2">
            <Button variant="gold" className="flex-1" asChild>
              <Link to={`/booking?tour=${tour.id}`}>Book This Tour</Link>
            </Button>
            <Button variant="default" className="flex-1" asChild>
              <Link to="/contact">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
