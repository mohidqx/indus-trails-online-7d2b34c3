import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Heart, MapPin, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string | null;
  location: string | null;
  likes: number;
  is_featured: boolean | null;
  created_at: string;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (data) setPhotos(data);
    setIsLoading(false);
  };

  const categories = [...new Set(photos.map(p => p.category).filter(Boolean))];
  const filtered = category ? photos.filter(p => p.category === category) : photos;
  const featured = photos.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-40 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">Photo Gallery</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Stunning views from Northern Pakistan captured by our travelers and team</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8 justify-center">
          <button
            onClick={() => setCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition ${!category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            All Photos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat!)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photos yet. Check back soon!</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setLightbox(photo)}
                className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-xl"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || 'Gallery photo'}
                  className="w-full rounded-xl group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                    {photo.location && (
                      <p className="text-white/70 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {photo.location}</p>
                    )}
                  </div>
                </div>
                {photo.is_featured && (
                  <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full">Featured</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.title || ''} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 rounded-b-lg">
              <p className="text-white font-medium">{lightbox.title}</p>
              {lightbox.location && <p className="text-white/60 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {lightbox.location}</p>}
              {lightbox.description && <p className="text-white/80 text-sm mt-1">{lightbox.description}</p>}
            </div>
            <button onClick={() => setLightbox(null)} className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
