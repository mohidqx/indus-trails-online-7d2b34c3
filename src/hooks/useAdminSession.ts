import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning before logout

export function useAdminSession() {
  const { signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const hasWarnedRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (!isAdmin) return;

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    hasWarnedRef.current = false;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      hasWarnedRef.current = true;
      toast({
        title: 'Session Expiring',
        description: 'Your admin session will expire in 1 minute due to inactivity.',
        variant: 'destructive',
      });
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: 'Session Expired',
        description: 'You have been logged out due to inactivity.',
        variant: 'destructive',
      });
      await signOut();
    }, INACTIVITY_TIMEOUT);
  }, [isAdmin, signOut, toast]);

  useEffect(() => {
    if (!isAdmin) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAdmin, resetTimer]);

  return { resetTimer };
}
