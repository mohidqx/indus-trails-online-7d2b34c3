import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SiteContent {
  company_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook_url: string;
  instagram_url: string;
  logo_url: string;
  announcement_text: string;
  announcement_active: boolean;
}

const defaultContent: SiteContent = {
  company_name: 'Indus Tours Pakistan',
  tagline: 'Discover the Beauty of Pakistan',
  hero_title: 'Discover the Untouched Beauty of Northern Pakistan',
  hero_subtitle: 'Embark on a journey through majestic mountains, pristine valleys, and ancient cultures',
  about_text: 'Founded by Shahzaib Khan Mughal, Indus Tours Pakistan is your gateway to the breathtaking northern regions.',
  phone: '+92 300 1234567',
  email: 'info@industours.pk',
  address: 'Islamabad, Pakistan',
  whatsapp: '+92 300 1234567',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  announcement_text: '',
  announcement_active: false,
};

export default function AdminContent() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value');

    if (!error && data) {
      const contentObj = { ...defaultContent };
      data.forEach((item) => {
        if (item.key in contentObj) {
          (contentObj as any)[item.key] = item.value;
        }
      });
      setContent(contentObj);
    }
    setIsLoading(false);
  };

  const saveContent = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upsert each content item
      for (const [key, value] of Object.entries(content)) {
        await supabase
          .from('site_content')
          .upsert({
            key,
            value,
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
      }

      toast({ title: 'Success', description: 'Content saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save content', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5" /> General Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={content.company_name}
                  onChange={(e) => setContent({ ...content, company_name: e.target.value })}
                  placeholder="Indus Tours Pakistan"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tagline</label>
                <Input
                  value={content.tagline}
                  onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                  placeholder="Discover the Beauty of Pakistan"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Logo URL</label>
              <Input
                value={content.logo_url}
                onChange={(e) => setContent({ ...content, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">About Text</label>
              <Textarea
                value={content.about_text}
                onChange={(e) => setContent({ ...content, about_text: e.target.value })}
                rows={4}
                placeholder="About the company..."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
            <div>
              <label className="text-sm font-medium">Hero Title</label>
              <Input
                value={content.hero_title}
                onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                placeholder="Main headline..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hero Subtitle</label>
              <Textarea
                value={content.hero_subtitle}
                onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                rows={2}
                placeholder="Supporting text..."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5" /> Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Phone
                </label>
                <Input
                  value={content.phone}
                  onChange={(e) => setContent({ ...content, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <Input
                  type="email"
                  value={content.email}
                  onChange={(e) => setContent({ ...content, email: e.target.value })}
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">WhatsApp</label>
                <Input
                  value={content.whatsapp}
                  onChange={(e) => setContent({ ...content, whatsapp: e.target.value })}
                  placeholder="+92 300 1234567"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Address
                </label>
                <Input
                  value={content.address}
                  onChange={(e) => setContent({ ...content, address: e.target.value })}
                  placeholder="Islamabad, Pakistan"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Social Media Links</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Facebook URL</label>
                <Input
                  value={content.facebook_url}
                  onChange={(e) => setContent({ ...content, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram URL</label>
                <Input
                  value={content.instagram_url}
                  onChange={(e) => setContent({ ...content, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Site Announcement
            </h3>
            <p className="text-sm text-muted-foreground">
              Display a banner at the top of the website for important announcements.
            </p>
            <div>
              <label className="text-sm font-medium">Announcement Text</label>
              <Textarea
                value={content.announcement_text}
                onChange={(e) => setContent({ ...content, announcement_text: e.target.value })}
                rows={2}
                placeholder="Special offer! Book now and get 20% off..."
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.announcement_active}
                onChange={(e) => setContent({ ...content, announcement_active: e.target.checked })}
              />
              Show announcement banner
            </label>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveContent} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
