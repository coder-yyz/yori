import { CONFIG } from 'src/global-config';

type TrackEventType = 'exposure' | 'click' | 'error' | 'custom';

type TrackMeta = Record<string, unknown>;

type TrackEventPayload = {
  eventType: TrackEventType;
  eventName: string;
  pagePath: string;
  pageUrl: string;
  referrer: string;
  userAgent: string;
  language: string;
  timeZone: string;
  screen: string;
  sessionId: string;
  anonymousId: string;
  userId: string;
  role: string;
  occurredAt: string;
  meta: TrackMeta;
  ip: string;
  city: string;
  country: string;
  logTime: string;
  isLoggedIn: boolean;
  userInfo: Record<string, unknown>;
};

type TrackingUserContext = {
  userId?: string;
  role?: string;
  isLoggedIn?: boolean;
  userInfo?: Record<string, unknown>;
};

type TrackingLocationContext = {
  ip?: string;
  city?: string;
  country?: string;
};

const TRACK_ENDPOINT = '/api/track/events';
const STORAGE_ANON_KEY = 'tracking_anonymous_id';
const STORAGE_SESSION_KEY = 'tracking_session_id';
const QUEUE_SIZE = 10;
const FLUSH_INTERVAL = 4000;

let initialized = false;
let flushTimer: number | null = null;
const queue: TrackEventPayload[] = [];
const exposedKeys = new Set<string>();
let exposureObserver: IntersectionObserver | null = null;
let trackingUserContext: TrackingUserContext = {};
let trackingLocationContext: TrackingLocationContext = {};

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readUserContextFromStorage(): TrackingUserContext {
  const token = localStorage.getItem('jwt_access_token');
  if (!token) {
    return {
      userId: '',
      role: '',
      isLoggedIn: false,
      userInfo: {},
    };
  }

  const payload = parseJwtPayload(token) || {};
  const userId = String(
    payload.user_uuid || payload.userId || payload.sub || payload.uid || ''
  ).trim();
  const role = String(payload.role || '').trim();

  return {
    userId,
    role,
    isLoggedIn: true,
    userInfo: {
      userId,
      role,
    },
  };
}

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${random}`;
}

function getPersistentId(key: string, prefix: string) {
  const current = localStorage.getItem(key);
  if (current) return current;
  const next = createId(prefix);
  localStorage.setItem(key, next);
  return next;
}

function getSessionId() {
  const current = sessionStorage.getItem(STORAGE_SESSION_KEY);
  if (current) return current;
  const next = createId('sid');
  sessionStorage.setItem(STORAGE_SESSION_KEY, next);
  return next;
}

function endpointUrl() {
  const base = CONFIG.serverUrl?.replace(/\/$/, '') || '';
  return `${base}${TRACK_ENDPOINT}`;
}

function buildPayload(
  eventType: TrackEventType,
  eventName: string,
  meta: TrackMeta = {}
): TrackEventPayload {
  const storageContext = readUserContextFromStorage();
  const userContext = {
    ...storageContext,
    ...trackingUserContext,
    userInfo: {
      ...(storageContext.userInfo || {}),
      ...(trackingUserContext.userInfo || {}),
    },
  };

  const now = new Date().toISOString();

  return {
    eventType,
    eventName,
    pagePath: window.location.pathname,
    pageUrl: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    sessionId: getSessionId(),
    anonymousId: getPersistentId(STORAGE_ANON_KEY, 'aid'),
    userId: String(userContext.userId || ''),
    role: String(userContext.role || ''),
    occurredAt: now,
    meta,
    ip: String(trackingLocationContext.ip || ''),
    city: String(trackingLocationContext.city || ''),
    country: String(trackingLocationContext.country || ''),
    logTime: now,
    isLoggedIn: Boolean(userContext.isLoggedIn),
    userInfo: userContext.userInfo || {},
  };
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush(false);
  }, FLUSH_INTERVAL);
}

async function postEvents(events: TrackEventPayload[], preferBeacon: boolean) {
  const body = JSON.stringify({ events });
  if (preferBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(endpointUrl(), blob);
    return;
  }

  await fetch(endpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  });
}

async function flush(preferBeacon: boolean) {
  if (!queue.length) return;
  const events = queue.splice(0, queue.length);
  try {
    await postEvents(events, preferBeacon);
  } catch {
    queue.unshift(...events.slice(0, QUEUE_SIZE));
  }
}

function enqueue(eventType: TrackEventType, eventName: string, meta: TrackMeta = {}) {
  if (!eventName) return;

  queue.push(buildPayload(eventType, eventName, meta));

  if (queue.length >= QUEUE_SIZE) {
    void flush(false);
    return;
  }

  scheduleFlush();
}

function collectClickMeta(target: Element) {
  const clickable = target.closest('[data-track-click],button,a,[role="button"]');
  if (!clickable) {
    return null;
  }

  const named = clickable as HTMLElement;
  const eventName =
    named.dataset.trackClick ||
    named.getAttribute('aria-label') ||
    named.textContent?.trim().slice(0, 64) ||
    'element_click';

  return {
    eventName,
    meta: {
      tag: clickable.tagName.toLowerCase(),
      id: clickable.id || undefined,
      className: clickable.className || undefined,
    },
  };
}

function setupGlobalClickTracking() {
  document.addEventListener(
    'click',
    (ev) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;
      const info = collectClickMeta(target);
      if (!info) return;
      enqueue('click', info.eventName, info.meta);
    },
    true
  );
}

function setupGlobalErrorTracking() {
  window.addEventListener('error', (ev) => {
    enqueue('error', 'window_error', {
      message: ev.message,
      filename: ev.filename,
      lineno: ev.lineno,
      colno: ev.colno,
    });
  });

  window.addEventListener('unhandledrejection', (ev) => {
    enqueue('error', 'unhandled_rejection', {
      reason: String(ev.reason),
    });
  });
}

function setupExposureTracking() {
  exposureObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const name = el.dataset.trackExposure || el.dataset.trackId || 'element_exposure';
        const key = `${window.location.pathname}:${name}`;

        if (exposedKeys.has(key)) return;
        exposedKeys.add(key);

        enqueue('exposure', name, {
          id: el.id || undefined,
          tag: el.tagName.toLowerCase(),
        });
      });
    },
    { threshold: 0.35 }
  );

  const bindTargets = () => {
    document.querySelectorAll('[data-track-exposure], [data-track-id]').forEach((el) => {
      exposureObserver?.observe(el);
    });
  };

  bindTargets();

  const mo = new MutationObserver(() => bindTargets());
  mo.observe(document.body, { childList: true, subtree: true });
}

function setupFlushOnLeave() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flush(true);
    }
  });

  window.addEventListener('beforeunload', () => {
    void flush(true);
  });
}

export function initTrackingSDK() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  enqueue('exposure', 'page_view', { title: document.title });
  setupGlobalClickTracking();
  setupGlobalErrorTracking();
  setupExposureTracking();
  setupFlushOnLeave();
}

export function trackExposure(eventName: string, meta?: TrackMeta) {
  enqueue('exposure', eventName, meta);
}

export function trackClick(eventName: string, meta?: TrackMeta) {
  enqueue('click', eventName, meta);
}

export function trackError(eventName: string, meta?: TrackMeta) {
  enqueue('error', eventName, meta);
}

export function trackCustom(eventName: string, meta?: TrackMeta) {
  enqueue('custom', eventName, meta);
}

export function setTrackingUserContext(context: TrackingUserContext) {
  trackingUserContext = {
    ...trackingUserContext,
    ...context,
    userInfo: {
      ...(trackingUserContext.userInfo || {}),
      ...(context.userInfo || {}),
    },
  };
}

export function setTrackingLocationContext(context: TrackingLocationContext) {
  trackingLocationContext = {
    ...trackingLocationContext,
    ...context,
  };
}
