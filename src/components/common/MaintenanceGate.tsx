import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, RefreshCw } from 'lucide-react';
import logo from '@/assets/indus-tours-logo.jpeg';

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [isMaintenanceOn, setIsMaintenanceOn] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [checked, setChecked] = useState(false);

  // Admin and auth routes are always accessible
  const isExemptRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth');

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (data?.value && typeof data.value === 'object' && 'enabled' in (data.value as any)) {
        const val = data.value as { enabled: boolean; message?: string };
        setIsMaintenanceOn(val.enabled);
        setMaintenanceMsg(val.message || 'We are currently performing maintenance. Please check back soon.');
      }
      setChecked(true);
    };
    check();

    // Subscribe to realtime changes on site_settings
    const channel = supabase
      .channel('maintenance-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.maintenance_mode' }, (payload: any) => {
        const val = payload.new?.value as { enabled: boolean; message?: string } | undefined;
        if (val) {
          setIsMaintenanceOn(val.enabled);
          setMaintenanceMsg(val.message || 'We are currently performing maintenance. Please check back soon.');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Don't block until we've checked
  if (!checked || authLoading) return <>{children}</>;

  // Admins and exempt routes bypass maintenance
  if (isMaintenanceOn && !isAdmin && !isExemptRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030508] via-[#0a0f1e] to-[#030508] flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Animated glow ring */}
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full border-2 border-primary/30 flex items-center justify-center bg-[#060a16]">
              <img src={logo} alt="Indus Tours" className="w-16 h-16 rounded-full object-cover" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs uppercase tracking-[0.3em] font-semibold">Under Maintenance</span>
              <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              We'll Be Back Soon
            </h1>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {maintenanceMsg}
            </p>
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

  return <>{children}</>;
}
