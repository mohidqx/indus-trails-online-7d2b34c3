import { useEffect, useRef } from 'react';

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = '';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    version = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    version = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  }

  return { browser, version };
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows NT')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
}

function getGPUInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        return {
          vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || 'Unknown',
          renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Unknown',
        };
      }
    }
  } catch {}
  return { vendor: 'Unknown', renderer: 'Unknown' };
}

function getOrientation() {
  if (screen.orientation) return screen.orientation.type;
  return window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary';
}

export function useVisitorTracking() {
  const sessionRef = useRef<string | null>(null);
  const metricsRef = useRef({ mouseMoves: 0, scrollDistance: 0, maxScroll: 0, sections: new Set<string>() });
  const startTimeRef = useRef(Date.now());
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const sessionId = generateSessionId();
    sessionRef.current = sessionId;

    const { browser, version } = getBrowserInfo();
    const gpu = getGPUInfo();
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

    const payload = {
      session_id: sessionId,
      user_agent: navigator.userAgent,
      browser,
      browser_version: version,
      os: getOS(),
      platform: navigator.platform || 'Unknown',
      language: navigator.language,
      all_languages: Array.from(navigator.languages || [navigator.language]),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tz_offset: new Date().getTimezoneOffset(),
      cookies_enabled: navigator.cookieEnabled,
      online: navigator.onLine,
      pdf_viewer: !!(navigator as any).pdfViewerEnabled,
      screen_width: screen.width,
      screen_height: screen.height,
      available_width: screen.availWidth,
      available_height: screen.availHeight,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      pixel_ratio: window.devicePixelRatio,
      color_depth: screen.colorDepth,
      orientation: getOrientation(),
      cpu_cores: navigator.hardwareConcurrency || 0,
      max_touch_points: navigator.maxTouchPoints || 0,
      touch_support: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      gpu_vendor: gpu.vendor,
      gpu_renderer: gpu.renderer,
      entry_url: window.location.href,
      nav_type: navEntry?.type || 'navigate',
    };

    const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    fetch(`${apiBase}/track-visitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify(payload),
    }).catch(() => {});

    // Track mouse moves
    const onMouseMove = () => { metricsRef.current.mouseMoves++; };
    
    // Track scroll
    const onScroll = () => {
      const scrollY = window.scrollY;
      const delta = Math.abs(scrollY - lastScrollRef.current);
      metricsRef.current.scrollDistance += delta;
      lastScrollRef.current = scrollY;
      
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        metricsRef.current.maxScroll = Math.max(
          metricsRef.current.maxScroll,
          Math.round((scrollY / docHeight) * 100)
        );
      }
    };

    // Track sections viewed via IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          metricsRef.current.sections.add(entry.target.id);
        }
      });
    }, { threshold: 0.3 });

    // Observe all sections
    setTimeout(() => {
      document.querySelectorAll('section[id], [data-section]').forEach(el => observer.observe(el));
    }, 1000);

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Send behavior data periodically and on unload
    const sendBehavior = () => {
      if (!sessionRef.current) return;
      const data = {
        session_id: sessionRef.current,
        time_on_page: Math.round((Date.now() - startTimeRef.current) / 1000),
        mouse_moves: metricsRef.current.mouseMoves,
        scroll_distance: metricsRef.current.scrollDistance,
        max_scroll: metricsRef.current.maxScroll,
        sections_viewed: Array.from(metricsRef.current.sections),
      };
      
      // Use sendBeacon for reliability on unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${apiBase}/track-visitor`,
          new Blob([JSON.stringify({ ...data, _method: 'PUT' })], { type: 'application/json' })
        );
      }
      
      fetch(`${apiBase}/track-visitor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify(data),
      }).catch(() => {});
    };

    const interval = setInterval(sendBehavior, 30000);
    window.addEventListener('beforeunload', sendBehavior);

    return () => {
      sendBehavior();
      clearInterval(interval);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', sendBehavior);
      observer.disconnect();
    };
  }, []);
}
