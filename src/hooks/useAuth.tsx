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

const recordUserSession = async (userId: string) => {
  try {
    await supabase.from('user_sessions').insert({
      user_id: userId,
      ip_address: null, // resolved server-side if needed
      user_agent: navigator.userAgent,
      browser: detectBrowser(),
      os: detectOS(),
      device_type: detectDeviceType(),
      is_active: true,
    });
  } catch (e) {
    console.error('Failed to record session:', e);
  }
};

const endUserSession = async (userId: string) => {
  try {
    await supabase
      .from('user_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_active', true);
  } catch (e) {
    console.error('Failed to end session:', e);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const sessionRecordedRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            checkAdminRole(currentSession.user.id);
          }, 0);

          // Record session on sign in
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !sessionRecordedRef.current) {
            sessionRecordedRef.current = true;
            setTimeout(() => recordUserSession(currentSession.user.id), 0);
          }
        } else {
          setIsAdmin(false);
          sessionRecordedRef.current = false;
        }

        // End session on sign out
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
          recordUserSession(existingSession.user.id);
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
