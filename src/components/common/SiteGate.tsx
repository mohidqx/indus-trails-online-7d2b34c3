import { useState, useEffect, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, RefreshCw, Lock, Shield } from 'lucide-react';
import logo from '@/assets/indus-tours-logo.jpeg';

interface SiteSettingValue {
  enabled: boolean;
  message?: string;
  type?: string;
  dismissible?: boolean;
  password?: string;
}

interface SiteSettings {
  maintenance_mode: SiteSettingValue;
  site_lockdown: SiteSettingValue;
  registration_enabled: SiteSettingValue;
  announcement_banner: SiteSettingValue & { type?: string; dismissible?: boolean };
}

const defaultSettings: SiteSettings = {
  maintenance_mode: { enabled: false },
  site_lockdown: { enabled: false },
  registration_enabled: { enabled: true },
  announcement_banner: { enabled: false, message: '', type: 'info', dismissible: true },
};

// Context so other components (Auth, etc.) can read site settings
const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);
export const useSiteSettings = () => useContext(SiteSettingsContext);

interface SiteGateProps {
  children: React.ReactNode;
}

export default function SiteGate({ children }: SiteGateProps) {
  const { isAdmin, user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [checked, setChecked] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const isExemptRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const s = { ...defaultSettings };
        data.forEach((row: any) => {
          if (row.key in s) {
            (s as any)[row.key] = row.value as SiteSettingValue;
          }
        });
        setSettings(s);
      }
      setChecked(true);
    };
    fetchSettings();

    const channel = supabase
      .channel('site-settings-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload: any) => {
        const key = payload.new?.key;
        const val = payload.new?.value;
        if (key && val) {
          setSettings(prev => ({ ...prev, [key]: val }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Reset announcement dismissal when it changes
  useEffect(() => {
    setAnnouncementDismissed(false);
  }, [settings.announcement_banner?.message]);

  if (!checked || authLoading) return <>{children}</>;

  // MAINTENANCE MODE — blocks non-admin users on public routes
  if (settings.maintenance_mode?.enabled && !isAdmin && !isExemptRoute) {
    return (
      <BlockPage
        icon={<Wrench className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: '3s' }} />}
        badge="Under Maintenance"
        title="We'll Be Back Soon"
        message={settings.maintenance_mode.message || 'We are currently performing maintenance. Please check back soon.'}
      />
    );
  }

  // SITE LOCKDOWN — blocks everyone except admins on public routes
  if (settings.site_lockdown?.enabled && !isAdmin && !isExemptRoute) {
    return (
      <BlockPage
        icon={<Lock className="w-6 h-6 text-orange-400" />}
        badge="Site Locked"
        title="Access Restricted"
        message="This site is currently locked down. Only authorized administrators can access it."
        badgeColor="orange"
      />
    );
  }

  // Announcement banner + children
  const showAnnouncement = settings.announcement_banner?.enabled && 
    settings.announcement_banner?.message && 
    !announcementDismissed && 
    !location.pathname.startsWith('/admin');

  return (
    <SiteSettingsContext.Provider value={settings}>
      {showAnnouncement && (
        <AnnouncementBanner
          message={settings.announcement_banner.message!}
          type={settings.announcement_banner.type || 'info'}
          dismissible={settings.announcement_banner.dismissible !== false}
          onDismiss={() => setAnnouncementDismissed(true)}
        />
      )}
      {children}
    </SiteSettingsContext.Provider>
  );
}

// ── Block Page (maintenance / lockdown) ──
function BlockPage({ icon, badge, title, message, badgeColor = 'primary' }: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  message: string;
  badgeColor?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary',
    orange: 'text-orange-400',
  };
  const borderMap: Record<string, string> = {
    primary: 'border-primary/30',
    orange: 'border-orange-400/30',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030508] via-[#0a0f1e] to-[#030508] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
          <div className={`relative w-28 h-28 rounded-full border-2 ${borderMap[badgeColor]} flex items-center justify-center bg-[#060a16]`}>
            <img src={logo} alt="Indus Tours" className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        <div className="space-y-3">
          <div className={`flex items-center justify-center gap-2 ${colorMap[badgeColor]}`}>
            {icon}
            <span className="text-xs uppercase tracking-[0.3em] font-semibold">{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">{title}</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">{message}</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/[0.08] hover:text-white transition-all text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <p className="text-[11px] text-gray-600">
          © {new Date().getFullYear()} Indus Tours & Travel. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ── Announcement Banner ──
function AnnouncementBanner({ message, type, dismissible, onDismiss }: {
  message: string;
  type: string;
  dismissible: boolean;
  onDismiss: () => void;
}) {
  const typeStyles: Record<string, string> = {
    info: 'bg-primary/90 text-primary-foreground',
    warning: 'bg-yellow-500/90 text-yellow-950',
    success: 'bg-emerald-500/90 text-white',
    danger: 'bg-red-500/90 text-white',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xl animate-in slide-in-from-top-4 fade-in duration-500">
      <div className={`${typeStyles[type] || typeStyles.info} rounded-xl py-3 px-5 text-sm font-medium shadow-2xl backdrop-blur-sm flex items-center gap-3`}>
        <span className="flex-1 text-center">{message}</span>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none font-bold ml-2"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
