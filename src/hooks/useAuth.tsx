import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const detectBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
};

const detectOS = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  return 'Other';
};

const detectDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
};

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

const recordUserSession = async (userId: string, email?: string) => {
  try {
    const response = await fetch(
      `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/track-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          user_id: userId,
          email: email || 'unknown',
          user_agent: navigator.userAgent,
          browser: detectBrowser(),
          os: detectOS(),
          device_type: detectDeviceType(),
        }),
      }
    );
    const result = await response.json();
    if (result.banned || result.ip_banned) {
      console.warn('⛔ Access blocked:', result.error);
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.error('Failed to record session:', e);
  }
};

const endUserSession = async (userId: string) => {
  try {
    await fetch(
      `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/track-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          user_id: userId,
          user_agent: navigator.userAgent,
        }),
      }
    );
  } catch (e) {
    console.error('Failed to end session:', e);
  }
};

const sendHeartbeat = async (userId: string) => {
  try {
    await fetch(
      `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/track-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat', user_id: userId }),
      }
    );
  } catch {}
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const sessionRecordedRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Heartbeat: update last_active_at every 60s
  useEffect(() => {
    if (user) {
      heartbeatRef.current = setInterval(() => sendHeartbeat(user.id), 60_000);
    }
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            checkAdminRole(currentSession.user.id);
          }, 0);

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !sessionRecordedRef.current) {
            sessionRecordedRef.current = true;
            setTimeout(() => recordUserSession(currentSession.user.id, currentSession.user.email), 0);
          }
        } else {
          setIsAdmin(false);
          sessionRecordedRef.current = false;
        }

        if (event === 'SIGNED_OUT' && user) {
          setTimeout(() => endUserSession(user.id), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        checkAdminRole(existingSession.user.id);
        if (!sessionRecordedRef.current) {
          sessionRecordedRef.current = true;
          recordUserSession(existingSession.user.id, existingSession.user.email);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  const signOut = async () => {
    if (user) {
      await endUserSession(user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
