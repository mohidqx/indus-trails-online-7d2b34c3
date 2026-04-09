// Import all tour images
import tourHunza from '@/assets/tour-hunza.jpg';
import tourFairyMeadows from '@/assets/tour-fairy-meadows.jpg';
import tourSkarduDeosai from '@/assets/tour-skardu-deosai.jpg';
import tourSwat from '@/assets/tour-swat.jpg';
import tourNorthPakistan from '@/assets/tour-north-pakistan.jpg';
import tourAstore from '@/assets/tour-astore.jpg';
import tourKhunjerab from '@/assets/tour-khunjerab.jpg';
import tourNaltar from '@/assets/tour-naltar.jpg';
import tourChitral from '@/assets/tour-chitral.jpg';
import tourKumrat from '@/assets/tour-kumrat.jpg';
import tourMurree from '@/assets/tour-murree.jpg';
import tourAyubia from '@/assets/tour-ayubia.jpg';
import tourNathiaGali from '@/assets/tour-nathiagali.jpg';
import tourIslamabad from '@/assets/tour-islamabad.jpg';
import tourNeelum from '@/assets/tour-neelum.jpg';
import tourDeosai from '@/assets/tour-deosai.jpg';

// Map tour keywords to their images
export function getTourImage(title: string, dbImageUrl: string | null): string {
  // If there's a valid URL from DB (not a local path), use it
  if (dbImageUrl && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('astore') || lowerTitle.includes('rama')) return tourAstore;
  if (lowerTitle.includes('khunjerab') || lowerTitle.includes('border')) return tourKhunjerab;
  if (lowerTitle.includes('naltar')) return tourNaltar;
  if (lowerTitle.includes('chitral') || lowerTitle.includes('kalash')) return tourChitral;
  if (lowerTitle.includes('kumrat') || lowerTitle.includes('katora')) return tourKumrat;
  if (lowerTitle.includes('murree') || lowerTitle.includes('patriata')) return tourMurree;
  if (lowerTitle.includes('ayubia') || lowerTitle.includes('pipeline')) return tourAyubia;
  if (lowerTitle.includes('nathia') || lowerTitle.includes('mushkpuri')) return tourNathiaGali;
  if (lowerTitle.includes('islamabad') || lowerTitle.includes('taxila') || lowerTitle.includes('faisal')) return tourIslamabad;
  if (lowerTitle.includes('neelum') || lowerTitle.includes('neelam') || lowerTitle.includes('ratti gali') || lowerTitle.includes('arang kel')) return tourNeelum;
  if (lowerTitle.includes('deosai') || lowerTitle.includes('sheosar')) return tourDeosai;
  if (lowerTitle.includes('hunza')) return tourHunza;
  if (lowerTitle.includes('fairy')) return tourFairyMeadows;
  if (lowerTitle.includes('skardu')) return tourSkarduDeosai;
  if (lowerTitle.includes('swat')) return tourSwat;
  if (lowerTitle.includes('north') || lowerTitle.includes('complete')) return tourNorthPakistan;
  
  return tourHunza; // Default fallback
}
