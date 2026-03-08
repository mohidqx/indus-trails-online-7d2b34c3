import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImageUpload from '@/components/common/ImageUpload';

interface Photo {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  location: string | null;
  is_approved: boolean | null;
  is_featured: boolean | null;
  likes: number;
  created_at: string;
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', category: 'landscape', location: '' });

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
    if (data) setPhotos(data);
    setIsLoading(false);
  };

  const uploadPhoto = async () => {
    if (!form.image_url) { toast({ title: "Image required", variant: "destructive" }); return; }
    await supabase.from('gallery_photos').insert({ ...form, is_approved: true });
    toast({ title: "Photo added!" });
    setShowUpload(false);
    setForm({ title: '', image_url: '', category: 'landscape', location: '' });
    fetchPhotos();
  };

  const approvePhoto = async (id: string) => {
    await supabase.from('gallery_photos').update({ is_approved: true }).eq('id', id);
    fetchPhotos();
  };

  const toggleFeatured = async (photo: Photo) => {
    await supabase.from('gallery_photos').update({ is_featured: !photo.is_featured }).eq('id', photo.id);
    fetchPhotos();
  };

  const deletePhoto = async (id: string) => {
    await supabase.from('gallery_photos').delete().eq('id', id);
    toast({ title: "Photo deleted" });
    fetchPhotos();
  };

  const pending = photos.filter(p => !p.is_approved);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Gallery ({photos.length}) {pending.length > 0 && <Badge className="ml-2 bg-amber-500/10 text-amber-400 border-0">{pending.length} pending</Badge>}</h2>
        <button onClick={() => setShowUpload(!showUpload)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {showUpload && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Photo title" className="w-full bg-muted rounded-lg px-4 py-2 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-muted rounded-lg px-4 py-2 text-sm outline-none">
                <option value="landscape">Landscape</option>
                <option value="adventure">Adventure</option>
                <option value="culture">Culture</option>
                <option value="wildlife">Wildlife</option>
                <option value="food">Food</option>
              </select>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="bg-muted rounded-lg px-4 py-2 text-sm outline-none" />
            </div>
            <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} label="Photo" />
            <button onClick={uploadPhoto} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium">Upload</button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map(photo => (
          <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-border">
            <img src={photo.image_url} alt={photo.title || ''} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div className="p-2 w-full">
                <p className="text-white text-xs truncate">{photo.title || 'Untitled'}</p>
                <div className="flex gap-1 mt-1">
                  {!photo.is_approved && (
                    <button onClick={() => approvePhoto(photo.id)} className="bg-emerald-500 text-white p-1 rounded text-[10px]"><Check className="w-3 h-3" /></button>
                  )}
                  <button onClick={() => toggleFeatured(photo)} className={`p-1 rounded text-[10px] ${photo.is_featured ? 'bg-amber-500 text-white' : 'bg-white/20 text-white'}`}><Star className="w-3 h-3" /></button>
                  <button onClick={() => deletePhoto(photo.id)} className="bg-red-500 text-white p-1 rounded text-[10px]"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            {!photo.is_approved && <Badge className="absolute top-1 left-1 text-[10px] bg-amber-500 text-white border-0">Pending</Badge>}
            {photo.is_featured && <Badge className="absolute top-1 right-1 text-[10px] bg-accent text-accent-foreground border-0">Featured</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}
