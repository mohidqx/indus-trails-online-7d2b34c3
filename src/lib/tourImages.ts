// Import all tour images
import tourHunza from '@/assets/tour-hunza.jpg';
import tourFairyMeadows from '@/assets/tour-fairy-meadows.jpg';
import tourSkarduDeosai from '@/assets/tour-skardu-deosai.jpg';
import tourSwat from '@/assets/tour-swat.jpg';
import tourNorthPakistan from '@/assets/tour-north-pakistan.jpg';

// Map tour keywords to their images
export function getTourImage(title: string, dbImageUrl: string | null): string {
  // If there's a valid URL from DB (not a local path), use it
  if (dbImageUrl && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('hunza')) return tourHunza;
  if (lowerTitle.includes('fairy')) return tourFairyMeadows;
  if (lowerTitle.includes('skardu') || lowerTitle.includes('deosai')) return tourSkarduDeosai;
  if (lowerTitle.includes('swat')) return tourSwat;
  if (lowerTitle.includes('north') || lowerTitle.includes('complete')) return tourNorthPakistan;
  
  return tourHunza; // Default fallback
}
