import { useState, useEffect } from 'react';
import { Save, Loader2, Search, Globe, FileText, Image, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SEOSettings {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  canonical_url: string;
  robots_txt: string;
  google_analytics_id: string;
  structured_data: string;
}

const defaultSEO: SEOSettings = {
  meta_title: 'Indus Tours Pakistan - Discover Northern Pakistan',
  meta_description: 'Book tours to Hunza, Skardu, Swat, Fairy Meadows & more. Professional tour packages with transport & hotels.',
  meta_keywords: 'pakistan tours, hunza valley, skardu tours, northern pakistan, tour packages',
  og_title: 'Indus Tours Pakistan',
  og_description: 'Explore the untouched beauty of Northern Pakistan with Indus Tours',
  og_image: '',
  twitter_card: 'summary_large_image',
  canonical_url: 'https://industours.pk',
  robots_txt: 'User-agent: *\nAllow: /\nSitemap: https://industours.pk/sitemap.xml',
  google_analytics_id: '',
  structured_data: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Indus Tours Pakistan",
    "description": "Professional tour packages in Northern Pakistan",
    "url": "https://industours.pk",
    "telephone": "+923118088007",
    "address": { "@type": "PostalAddress", "addressLocality": "Islamabad", "addressCountry": "PK" }
  }, null, 2),
};

export default function AdminSEO() {
  const { toast } = useToast();
  const [seo, setSeo] = useState<SEOSettings>(defaultSEO);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('site_content').select('key, value');
    if (data) {
      const obj = { ...defaultSEO };
      data.forEach((item) => {
        if (item.key in obj) (obj as any)[item.key] = item.value;
      });
      setSeo(obj);
    }
    setIsLoading(false);
  };

  const saveSEO = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      for (const [key, value] of Object.entries(seo)) {
        await supabase.from('site_content').upsert({
          key, value, updated_by: user?.id, updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      }
      toast({ title: 'Success', description: 'SEO settings saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="meta" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="social">Social / OG</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="schema">Schema Markup</TabsTrigger>
        </TabsList>

        <TabsContent value="meta" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> Meta Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Page Title <span className="text-primary">({seo.meta_title.length}/60)</span></label>
                <Input value={seo.meta_title} onChange={e => setSeo({...seo, meta_title: e.target.value})} className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Meta Description <span className="text-primary">({seo.meta_description.length}/160)</span></label>
                <Textarea value={seo.meta_description} onChange={e => setSeo({...seo, meta_description: e.target.value})} rows={3} className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Keywords (comma separated)</label>
                <Input value={seo.meta_keywords} onChange={e => setSeo({...seo, meta_keywords: e.target.value})} className="bg-background/50" />
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Google Preview</p>
                <div className="space-y-0.5">
                  <p className="text-blue-400 text-base font-medium truncate">{seo.meta_title || 'Page Title'}</p>
                  <p className="text-emerald-400 text-xs font-mono">{seo.canonical_url || 'https://industours.pk'}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">{seo.meta_description || 'Meta description...'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Open Graph & Twitter</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">OG Title</label>
                <Input value={seo.og_title} onChange={e => setSeo({...seo, og_title: e.target.value})} className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">OG Description</label>
                <Textarea value={seo.og_description} onChange={e => setSeo({...seo, og_description: e.target.value})} rows={2} className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">OG Image URL</label>
                <Input value={seo.og_image} onChange={e => setSeo({...seo, og_image: e.target.value})} placeholder="https://..." className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Twitter Card Type</label>
                <select value={seo.twitter_card} onChange={e => setSeo({...seo, twitter_card: e.target.value})} className="w-full rounded-md bg-background/50 border border-border px-3 py-2 text-sm">
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Code className="w-4 h-4 text-emerald-400" /> Technical SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Canonical URL</label>
                <Input value={seo.canonical_url} onChange={e => setSeo({...seo, canonical_url: e.target.value})} className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Google Analytics ID</label>
                <Input value={seo.google_analytics_id} onChange={e => setSeo({...seo, google_analytics_id: e.target.value})} placeholder="G-XXXXXXXXXX" className="bg-background/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">robots.txt</label>
                <Textarea value={seo.robots_txt} onChange={e => setSeo({...seo, robots_txt: e.target.value})} rows={4} className="bg-background/50 font-mono text-xs" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> JSON-LD Schema</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={seo.structured_data} onChange={e => setSeo({...seo, structured_data: e.target.value})} rows={12} className="bg-background/50 font-mono text-xs" />
              <p className="text-[10px] text-muted-foreground mt-2">This structured data will be embedded in the website for rich search results.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSEO} disabled={isSaving} size="lg">
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save SEO Settings</>}
        </Button>
      </div>
    </div>
  );
}
