// Import all destination images
import attabadLake from '@/assets/attabad-lake.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import skardu from '@/assets/skardu.jpg';
import swatValley from '@/assets/swat-valley.jpg';
import naranKaghan from '@/assets/naran-kaghan.jpg';
import malamJabba from '@/assets/malam-jabba.jpg';
import neelamValley from '@/assets/neelam-valley.jpg';

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
};

export function getDestinationImage(name: string, dbImageUrl: string | null): string {
  // If there's a valid URL from DB (not a local path), use it
  if (dbImageUrl && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  // Otherwise use our bundled images
  return destinationImages[name] || attabadLake;
}
