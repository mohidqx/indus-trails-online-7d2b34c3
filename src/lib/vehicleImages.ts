// Import all vehicle images
import landCruiser from '@/assets/land-cruiser.jpg';
import prado from '@/assets/prado.jpg';
import fortuner from '@/assets/fortuner.jpg';
import hiace from '@/assets/hiace.jpg';
import coaster from '@/assets/coaster.jpg';

// Map vehicle names to their images
export function getVehicleImage(name: string, dbImageUrl: string | null): string {
  // If there's a valid URL from DB (not a local path), use it
  if (dbImageUrl && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  
  const lowerName = name.toLowerCase();
  if (lowerName.includes('land cruiser')) return landCruiser;
  if (lowerName.includes('prado')) return prado;
  if (lowerName.includes('fortuner')) return fortuner;
  if (lowerName.includes('hiace')) return hiace;
  if (lowerName.includes('coaster')) return coaster;
  
  return landCruiser; // Default fallback
}
