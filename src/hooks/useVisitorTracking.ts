import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

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
          extensions: gl.getSupportedExtensions()?.length || 0,
        };
      }
    }
  } catch {}
  return { vendor: 'Unknown', renderer: 'Unknown', extensions: 0 };
}

function getOrientation() {
  if (screen.orientation) return screen.orientation.type;
  return window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary';
}

async function getBatteryInfo() {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return { level: Math.round(battery.level * 100), charging: battery.charging };
    }
  } catch {}
  return { level: null, charging: null };
}

function getConnectionInfo() {
  try {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      return { type: conn.effectiveType || conn.type || null, downlink: conn.downlink || null };
    }
  } catch {}
  return { type: null, downlink: null };
}

function getPageLoadTimes() {
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      return {
        pageLoad: Math.round(navEntry.loadEventEnd - navEntry.startTime),
        domLoad: Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime),
      };
    }
  } catch {}
  return { pageLoad: null, domLoad: null };
}

// Canvas fingerprint — unique-ish hash per device
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('IndusTrack!@#$', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('IndusTrack!@#$', 4, 17);
    const dataUrl = canvas.toDataURL();
    // Simple hash
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      const char = dataUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  } catch {}
  return '';
}

// Audio context fingerprint
function getAudioFingerprint(): string {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    const processor = ctx.createScriptProcessor(4096, 1, 1);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);

    oscillator.connect(analyser);
    analyser.connect(processor);
    processor.connect(gain);
    gain.connect(ctx.destination);

    const fingerprint = analyser.frequencyBinCount.toString(36) + '-' + ctx.sampleRate.toString(36);
    ctx.close();
    return fingerprint;
  } catch {}
  return '';
}

// Detect ad blocker
async function detectAdBlocker(): Promise<boolean> {
  try {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox ad-placement ad-banner textads banner-ads';
    testAd.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(testAd);
    await new Promise(r => setTimeout(r, 100));
    const blocked = testAd.offsetHeight === 0 || testAd.clientHeight === 0;
    document.body.removeChild(testAd);
    if (blocked) return true;

    // Also try fetching a known ad script URL
    try {
      await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD', mode: 'no-cors'
      });
      return false;
    } catch {
      return true;
    }
  } catch {}
  return false;
}

// Detect incognito/private mode
async function detectIncognito(): Promise<boolean> {
  try {
    // Chrome/Chromium based
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota && estimate.quota < 120000000) return true; // Incognito has < ~120MB
    }
    // Firefox
    const db = indexedDB.open('test');
    return await new Promise((resolve) => {
      db.onerror = () => resolve(true);
      db.onsuccess = () => {
        db.result.close();
        resolve(false);
      };
    });
  } catch {}
  return false;
}

// Get UTM parameters
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  };
}

// Get referrer info
function getReferrerInfo() {
  const referrer = document.referrer || null;
  let domain = null;
  if (referrer) {
    try { domain = new URL(referrer).hostname; } catch {}
  }
  return { referrer, domain };
}

// Get storage quota
async function getStorageQuota(): Promise<number | null> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const est = await navigator.storage.estimate();
      return est.quota || null;
    }
  } catch {}
  return null;
}

// Detect media devices
async function getMediaDevices() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return { camera: false, microphone: false };
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      camera: devices.some(d => d.kind === 'videoinput'),
      microphone: devices.some(d => d.kind === 'audioinput'),
    };
  } catch {}
  return { camera: false, microphone: false };
}

// Get installed plugins
function getPlugins(): string[] {
  try {
    return Array.from(navigator.plugins || []).map(p => p.name).slice(0, 20);
  } catch {}
  return [];
}

// Get JS heap size (Chrome only)
function getHeapSize(): number | null {
  try {
    const perf = (performance as any);
    if (perf.memory) {
      return Math.round(perf.memory.usedJSHeapSize / 1024 / 1024); // MB
    }
  } catch {}
  return null;
}

export function useVisitorTracking() {
  const sessionRef = useRef<string | null>(null);
  const metricsRef = useRef({
    mouseMoves: 0,
    scrollDistance: 0,
    maxScroll: 0,
    sections: new Set<string>(),
    totalClicks: 0,
    rageClicks: 0,
    tabSwitches: 0,
    tabHiddenTime: 0,
    formInteractions: 0,
    formAbandons: 0,
    copyEvents: 0,
    rightClickEvents: 0,
    orientationChanges: 0,
    idleTime: 0,
    pagesVisited: new Set<string>(),
  });
  const startTimeRef = useRef(Date.now());
  const lastScrollRef = useRef(0);
  const clickTimestampsRef = useRef<number[]>([]);
  const tabHiddenAtRef = useRef<number | null>(null);
  const lastActivityRef = useRef(Date.now());
  const location = useLocation();

  // Track page navigation
  useEffect(() => {
    if (sessionRef.current) {
      metricsRef.current.pagesVisited.add(window.location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const sessionId = generateSessionId();
    sessionRef.current = sessionId;
    metricsRef.current.pagesVisited.add(window.location.pathname);

    const { browser, version } = getBrowserInfo();
    const gpu = getGPUInfo();
    const connection = getConnectionInfo();
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const referrerInfo = getReferrerInfo();
    const utmParams = getUTMParams();
    const canvasFingerprint = getCanvasFingerprint();
    const audioFingerprint = getAudioFingerprint();
    const dnt = navigator.doNotTrack === '1' || (window as any).doNotTrack === '1';

    const sendInitialPayload = async () => {
      const [battery, adBlocker, incognito, storageQuota, mediaDevices] = await Promise.all([
        getBatteryInfo(),
        detectAdBlocker(),
        detectIncognito(),
        getStorageQuota(),
        getMediaDevices(),
      ]);
      const loadTimes = getPageLoadTimes();
      const plugins = getPlugins();
      const heapSize = getHeapSize();

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
        device_memory: (navigator as any).deviceMemory || null,
        connection_type: connection.type,
        downlink: connection.downlink,
        battery_level: battery.level,
        battery_charging: battery.charging,
        page_load_time: loadTimes.pageLoad,
        dom_load_time: loadTimes.domLoad,
        // NEW FIELDS
        referrer: referrerInfo.referrer,
        referrer_domain: referrerInfo.domain,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
        canvas_fingerprint: canvasFingerprint,
        audio_fingerprint: audioFingerprint,
        webgl_fingerprint: gpu.renderer?.substring(0, 50) || null,
        ad_blocker_detected: adBlocker,
        incognito_detected: incognito,
        do_not_track: dnt,
        service_worker_support: 'serviceWorker' in navigator,
        webgl_extensions: gpu.extensions,
        has_camera: mediaDevices.camera,
        has_microphone: mediaDevices.microphone,
        installed_plugins: plugins,
        storage_quota: storageQuota,
        js_heap_size: heapSize,
      };

      const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
      fetch(`${apiBase}/track-visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify(payload),
      }).catch(() => {});
    };

    setTimeout(sendInitialPayload, 2000);

    const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

    // Track mouse moves
    const onMouseMove = () => {
      metricsRef.current.mouseMoves++;
      lastActivityRef.current = Date.now();
    };

    // Track scroll
    const onScroll = () => {
      const scrollY = window.scrollY;
      const delta = Math.abs(scrollY - lastScrollRef.current);
      metricsRef.current.scrollDistance += delta;
      lastScrollRef.current = scrollY;
      lastActivityRef.current = Date.now();

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        metricsRef.current.maxScroll = Math.max(
          metricsRef.current.maxScroll,
          Math.round((scrollY / docHeight) * 100)
        );
      }
    };

    // Track clicks + rage clicks
    const onClick = () => {
      metricsRef.current.totalClicks++;
      lastActivityRef.current = Date.now();
      const now = Date.now();
      clickTimestampsRef.current.push(now);
      // Keep only last 2 seconds of clicks
      clickTimestampsRef.current = clickTimestampsRef.current.filter(t => now - t < 2000);
      if (clickTimestampsRef.current.length >= 4) {
        metricsRef.current.rageClicks++;
        clickTimestampsRef.current = [];
      }
    };

    // Track tab visibility (focus/blur)
    const onVisibilityChange = () => {
      if (document.hidden) {
        tabHiddenAtRef.current = Date.now();
        metricsRef.current.tabSwitches++;
      } else {
        if (tabHiddenAtRef.current) {
          metricsRef.current.tabHiddenTime += Math.round((Date.now() - tabHiddenAtRef.current) / 1000);
          tabHiddenAtRef.current = null;
        }
      }
    };

    // Track form interactions
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        metricsRef.current.formInteractions++;
        lastActivityRef.current = Date.now();
      }
    };

    // Track copy events
    const onCopy = () => { metricsRef.current.copyEvents++; };

    // Track right clicks
    const onContextMenu = () => { metricsRef.current.rightClickEvents++; };

    // Track orientation changes
    const onOrientationChange = () => { metricsRef.current.orientationChanges++; };

    // Track sections viewed
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id || entry.target.getAttribute('data-section') || entry.target.tagName;
          if (id) metricsRef.current.sections.add(id);
        }
      });
    }, { threshold: 0.3 });

    setTimeout(() => {
      document.querySelectorAll('section, [data-section]').forEach(el => observer.observe(el));
    }, 1000);

    // Idle time tracker
    const idleInterval = setInterval(() => {
      const idleSeconds = Math.round((Date.now() - lastActivityRef.current) / 1000);
      if (idleSeconds > 5) {
        metricsRef.current.idleTime += 5; // Add 5 seconds of idle per check
      }
    }, 5000);

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('focusin', onFocusIn, { passive: true });
    document.addEventListener('copy', onCopy);
    document.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('orientationchange', onOrientationChange);

    const sendBehavior = () => {
      if (!sessionRef.current) return;

      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      const engagementScore = calculateEngagement(metricsRef.current, timeOnPage);

      const data = {
        session_id: sessionRef.current,
        time_on_page: timeOnPage,
        mouse_moves: metricsRef.current.mouseMoves,
        scroll_distance: metricsRef.current.scrollDistance,
        max_scroll: metricsRef.current.maxScroll,
        sections_viewed: Array.from(metricsRef.current.sections),
        total_clicks: metricsRef.current.totalClicks,
        rage_clicks: metricsRef.current.rageClicks,
        tab_switches: metricsRef.current.tabSwitches,
        tab_hidden_time: metricsRef.current.tabHiddenTime,
        form_interactions: metricsRef.current.formInteractions,
        copy_events: metricsRef.current.copyEvents,
        right_click_events: metricsRef.current.rightClickEvents,
        screen_orientation_changes: metricsRef.current.orientationChanges,
        idle_time: metricsRef.current.idleTime,
        engagement_score: engagementScore,
        pages_visited: Array.from(metricsRef.current.pagesVisited),
        exit_url: window.location.href,
        js_heap_size: getHeapSize(),
      };

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
      clearInterval(idleInterval);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('orientationchange', onOrientationChange);
      window.removeEventListener('beforeunload', sendBehavior);
      observer.disconnect();
    };
  }, []);
}

// Calculate engagement score 0-100
function calculateEngagement(metrics: any, timeOnPage: number): number {
  let score = 0;

  // Time on page (max 25 points)
  score += Math.min(25, timeOnPage / 12);

  // Scroll depth (max 20 points)
  score += (metrics.maxScroll / 100) * 20;

  // Clicks (max 15 points)
  score += Math.min(15, metrics.totalClicks * 1.5);

  // Mouse activity (max 10 points)
  score += Math.min(10, metrics.mouseMoves / 50);

  // Sections viewed (max 10 points)
  score += Math.min(10, metrics.sections.size * 2.5);

  // Pages visited (max 10 points)
  score += Math.min(10, metrics.pagesVisited.size * 3);

  // Form interaction bonus (max 10 points)
  score += Math.min(10, metrics.formInteractions * 5);

  // Penalties
  score -= metrics.rageClicks * 3; // Frustrated user
  score -= Math.min(10, metrics.idleTime / 30); // Idle penalty

  return Math.max(0, Math.min(100, Math.round(score)));
}
