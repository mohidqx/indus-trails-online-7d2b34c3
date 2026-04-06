import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Mail, MapPin, AlertCircle, Eye, Palette, Layout, FileText, Image, RefreshCw, CheckCircle2, Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/common/RichTextEditor';
import ImageUpload from '@/components/common/ImageUpload';

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
  twitter_url: string;
  youtube_url: string;
  tiktok_url: string;
  logo_url: string;
  favicon_url: string;
  hero_image_url: string;
  about_image_url: string;
  announcement_text: string;
  announcement_active: boolean;
  footer_text: string;
  booking_terms: string;
  privacy_policy: string;
  cancellation_policy: string;
  why_choose_us_1_title: string;
  why_choose_us_1_desc: string;
  why_choose_us_2_title: string;
  why_choose_us_2_desc: string;
  why_choose_us_3_title: string;
  why_choose_us_3_desc: string;
  cta_title: string;
  cta_subtitle: string;
  contact_page_title: string;
  contact_page_subtitle: string;
}

const defaultContent: SiteContent = {
  company_name: 'Indus Tours Pakistan',
  tagline: 'Discover the Beauty of Pakistan',
  hero_title: 'Discover the Untouched Beauty of Northern Pakistan',
  hero_subtitle: 'Embark on a journey through majestic mountains, pristine valleys, and ancient cultures',
  about_text: '<p>Founded by Shahzaib Khan Mughal, Indus Tours Pakistan is your gateway to the breathtaking northern regions.</p>',
  phone: '+92 300 1234567',
  email: 'info@industours.pk',
  address: 'Islamabad, Pakistan',
  whatsapp: '+92 300 1234567',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  youtube_url: '',
  tiktok_url: '',
  logo_url: '',
  favicon_url: '',
  hero_image_url: '',
  about_image_url: '',
  announcement_text: '',
  announcement_active: false,
  footer_text: '© 2024 Indus Tours Pakistan. All rights reserved.',
  booking_terms: '<p>Standard booking terms and conditions apply.</p>',
  privacy_policy: '<p>Your privacy is important to us.</p>',
  cancellation_policy: '<p>Cancellations must be made 48 hours before departure.</p>',
  why_choose_us_1_title: 'Expert Local Guides',
  why_choose_us_1_desc: 'Our team of experienced local guides ensures authentic experiences',
  why_choose_us_2_title: 'Best Price Guarantee',
  why_choose_us_2_desc: 'We offer competitive pricing without compromising quality',
  why_choose_us_3_title: 'Safe & Secure Travel',
  why_choose_us_3_desc: 'Your safety is our top priority on every adventure',
  cta_title: 'Ready for Your Adventure?',
  cta_subtitle: 'Book your dream tour today and experience the magic of Pakistan',
  contact_page_title: 'Get in Touch',
  contact_page_subtitle: 'We would love to hear from you',
};

export default function AdminCMS() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('branding');
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Shahzaib Khan Mughal', role: 'Founder & CEO', initials: 'SM', desc: 'Visionary leader with a passion for showcasing Pakistan\'s beauty' },
    { name: 'Mohid Mughal', role: 'Head of Operations', initials: 'MM', desc: 'Ensuring smooth operations and customer satisfaction' },
  ]);

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (!error && data) {
      const contentObj = { ...defaultContent };
      data.forEach((item) => {
        if (item.key === 'team_members' && Array.isArray(item.value)) {
          setTeamMembers(item.value as any[]);
        } else if (item.key in contentObj) {
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
      for (const [key, value] of Object.entries(content)) {
        await supabase.from('site_content').upsert({
          key, value: value as any,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      }
      // Save team members
      await supabase.from('site_content').upsert({
        key: 'team_members',
        value: teamMembers as any,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
      setLastSaved(new Date().toLocaleTimeString());
      toast({ title: '✅ Content Saved', description: 'All changes published to the website.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save content', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: keyof SiteContent, value: any) => {
    setContent(prev => ({ ...prev, [key]: value }));
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Content Management System</h2>
            <p className="text-xs text-muted-foreground">
              {lastSaved ? `Last saved at ${lastSaved}` : 'Manage all website content from one place'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchContent} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </Button>
          <Button onClick={saveContent} disabled={isSaving} size="sm" className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="branding" className="gap-1.5 text-xs"><Globe className="w-3.5 h-3.5" /> Branding</TabsTrigger>
          <TabsTrigger value="hero" className="gap-1.5 text-xs"><Layout className="w-3.5 h-3.5" /> Hero & Home</TabsTrigger>
          <TabsTrigger value="about" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" /> About</TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs"><Phone className="w-3.5 h-3.5" /> Contact</TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5 text-xs"><Globe className="w-3.5 h-3.5" /> Social</TabsTrigger>
          <TabsTrigger value="policies" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" /> Policies</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Team</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5 text-xs"><AlertCircle className="w-3.5 h-3.5" /> Alerts</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">Identity</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Company Name</label>
                  <Input value={content.company_name} onChange={e => updateField('company_name', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tagline</label>
                  <Input value={content.tagline} onChange={e => updateField('tagline', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Footer Text</label>
                <Input value={content.footer_text} onChange={e => updateField('footer_text', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Logo</label>
                  <ImageUpload value={content.logo_url} onChange={url => updateField('logo_url', url)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Favicon</label>
                  <ImageUpload value={content.favicon_url} onChange={url => updateField('favicon_url', url)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero & Home */}
        <TabsContent value="hero" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <Badge variant="outline" className="text-[10px]">Hero Section</Badge>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Hero Title</label>
                <Input value={content.hero_title} onChange={e => updateField('hero_title', e.target.value)} className="text-lg font-bold" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Hero Subtitle</label>
                <Input value={content.hero_subtitle} onChange={e => updateField('hero_subtitle', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Hero Background Image</label>
                <ImageUpload value={content.hero_image_url} onChange={url => updateField('hero_image_url', url)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <Badge variant="outline" className="text-[10px]">Why Choose Us</Badge>
              {[1, 2, 3].map(i => (
                <div key={i} className="grid md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Feature {i} Title</label>
                    <Input
                      value={(content as any)[`why_choose_us_${i}_title`]}
                      onChange={e => updateField(`why_choose_us_${i}_title` as keyof SiteContent, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Feature {i} Description</label>
                    <Input
                      value={(content as any)[`why_choose_us_${i}_desc`]}
                      onChange={e => updateField(`why_choose_us_${i}_desc` as keyof SiteContent, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <Badge variant="outline" className="text-[10px]">Call-to-Action Section</Badge>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">CTA Title</label>
                  <Input value={content.cta_title} onChange={e => updateField('cta_title', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">CTA Subtitle</label>
                  <Input value={content.cta_subtitle} onChange={e => updateField('cta_subtitle', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <Badge variant="outline" className="text-[10px]">About Page Content</Badge>
              <div>
                <label className="text-sm font-medium mb-1.5 block">About Image</label>
                <ImageUpload value={content.about_image_url} onChange={url => updateField('about_image_url', url)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">About Text (Rich Editor)</label>
                <RichTextEditor
                  content={typeof content.about_text === 'string' ? content.about_text : ''}
                  onChange={html => updateField('about_text', html)}
                  placeholder="Write about your company..."
                  minHeight="250px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <Badge variant="outline" className="text-[10px]">Contact Information</Badge>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <Input value={content.phone} onChange={e => updateField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                  <Input type="email" value={content.email} onChange={e => updateField('email', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">WhatsApp</label>
                  <Input value={content.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</label>
                  <Input value={content.address} onChange={e => updateField('address', e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Contact Page Title</label>
                  <Input value={content.contact_page_title} onChange={e => updateField('contact_page_title', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Contact Page Subtitle</label>
                  <Input value={content.contact_page_subtitle} onChange={e => updateField('contact_page_subtitle', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <Badge variant="outline" className="text-[10px]">Social Media Links</Badge>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { key: 'facebook_url', label: 'Facebook URL', ph: 'https://facebook.com/...' },
                  { key: 'instagram_url', label: 'Instagram URL', ph: 'https://instagram.com/...' },
                  { key: 'twitter_url', label: 'Twitter / X URL', ph: 'https://x.com/...' },
                  { key: 'youtube_url', label: 'YouTube URL', ph: 'https://youtube.com/...' },
                  { key: 'tiktok_url', label: 'TikTok URL', ph: 'https://tiktok.com/...' },
                ].map(s => (
                  <div key={s.key}>
                    <label className="text-sm font-medium mb-1.5 block">{s.label}</label>
                    <Input
                      value={(content as any)[s.key] || ''}
                      onChange={e => updateField(s.key as keyof SiteContent, e.target.value)}
                      placeholder={s.ph}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-4">
          {[
            { key: 'booking_terms', label: 'Booking Terms & Conditions' },
            { key: 'privacy_policy', label: 'Privacy Policy' },
            { key: 'cancellation_policy', label: 'Cancellation Policy' },
          ].map(p => (
            <Card key={p.key} className="border-0 shadow-card">
              <CardContent className="p-6 space-y-3">
                <Badge variant="outline" className="text-[10px]">{p.label}</Badge>
                <RichTextEditor
                  content={typeof (content as any)[p.key] === 'string' ? (content as any)[p.key] : ''}
                  onChange={html => updateField(p.key as keyof SiteContent, html)}
                  placeholder={`Write ${p.label.toLowerCase()}...`}
                  minHeight="200px"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">Team Members (About Page)</Badge>
                <Button variant="outline" size="sm" onClick={() => setTeamMembers(prev => [...prev, { name: '', role: '', initials: '', desc: '' }])} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </Button>
              </div>
              {teamMembers.map((member, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member {i + 1}</span>
                    {teamMembers.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => setTeamMembers(prev => prev.filter((_, j) => j !== i))} className="text-destructive h-7 w-7 p-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Name</label>
                      <Input value={member.name} onChange={e => setTeamMembers(prev => prev.map((m, j) => j === i ? { ...m, name: e.target.value, initials: e.target.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() } : m))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Role</label>
                      <Input value={member.role} onChange={e => setTeamMembers(prev => prev.map((m, j) => j === i ? { ...m, role: e.target.value } : m))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Description</label>
                    <Input value={member.desc} onChange={e => setTeamMembers(prev => prev.map((m, j) => j === i ? { ...m, desc: e.target.value } : m))} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent" />
                <Badge variant="outline" className="text-[10px]">Site Announcement Banner</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Display a banner at the top of the website for important announcements.</p>
              <RichTextEditor
                content={typeof content.announcement_text === 'string' ? content.announcement_text : ''}
                onChange={html => updateField('announcement_text', html)}
                placeholder="Special offer! Book now and get 20% off..."
                minHeight="100px"
              />
              <div className="flex items-center gap-3">
                <Switch
                  checked={content.announcement_active as boolean}
                  onCheckedChange={checked => updateField('announcement_active', checked)}
                />
                <span className="text-sm">Show announcement banner on website</span>
                {content.announcement_active && <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">LIVE</Badge>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={saveContent} disabled={isSaving} size="lg" className="shadow-xl gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {isSaving ? 'Publishing...' : 'Publish All Changes'}
        </Button>
      </div>
    </div>
  );
}
