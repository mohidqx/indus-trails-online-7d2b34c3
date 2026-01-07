import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
}

export default function ImageUpload({ value, onChange, folder = 'general' }: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to upload image', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No image selected</p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              Use URL
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showUrlInput && !value && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          <Button type="button" onClick={handleUrlSubmit} size="sm">
            Add
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput(false)}>
            Cancel
          </Button>
        </div>
      )}

      {value && (
        <p className="text-xs text-muted-foreground truncate">{value}</p>
      )}
    </div>
  );
}
