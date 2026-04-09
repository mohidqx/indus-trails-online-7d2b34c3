// Import all destination images
import attabadLake from '@/assets/attabad-lake.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import skardu from '@/assets/skardu.jpg';
import swatValley from '@/assets/swat-valley.jpg';
import naranKaghan from '@/assets/naran-kaghan.jpg';
import malamJabba from '@/assets/malam-jabba.jpg';
import neelamValley from '@/assets/neelam-valley.jpg';
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

// Map destination names to their images
export const destinationImages: Record<string, string> = {
  'Hunza Valley': attabadLake,
  'Fairy Meadows': fairyMeadows,
  'Skardu': skardu,
  'Swat Valley': swatValley,
  'Naran Kaghan': naranKaghan,
  'Swat Kalam': swatValley,
  'Malam Jabba': malamJabba,
  'Kashmir (Neelam Valley)': neelamValley,
  'Astore Valley': tourAstore,
  'Astore': tourAstore,
  'Khunjerab Pass': tourKhunjerab,
  'Khunjerab': tourKhunjerab,
  'Naltar Valley': tourNaltar,
  'Naltar': tourNaltar,
  'Chitral': tourChitral,
  'Chitral & Kalash': tourChitral,
  'Kumrat Valley': tourKumrat,
  'Kumrat': tourKumrat,
  'Murree': tourMurree,
  'Ayubia National Park': tourAyubia,
  'Ayubia': tourAyubia,
  'Nathia Gali': tourNathiaGali,
  'Islamabad': tourIslamabad,
  'Neelum Valley': tourNeelum,
  'Deosai': tourDeosai,
  'Deosai National Park': tourDeosai,
};

export function getDestinationImage(name: string, dbImageUrl: string | null): string {
  // If there's a valid URL from DB (not a local path), use it
  if (dbImageUrl && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  // Otherwise use our bundled images - try exact match first, then partial
  if (destinationImages[name]) return destinationImages[name];
  
  const lowerName = name.toLowerCase();
  for (const [key, img] of Object.entries(destinationImages)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return img;
    }
  }
  
  return attabadLake;
}
