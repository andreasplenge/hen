// ============================================================
// Analytics — configure your endpoint here
// ============================================================

export const ANALYTICS_ENDPOINT = "https://ahzrpcexavpjilrlscgt.supabase.co/functions/v1/page-visit";

// ============================================================
// Helpers
// ============================================================

function getSessionId(): string {
  const key = "ap_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function markReturnVisit(): boolean {
  const key = "ap_visited";
  const isReturn = localStorage.getItem(key) === "1";
  localStorage.setItem(key, "1");
  return isReturn;
}

function deviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ============================================================
// Payload
// ============================================================

export interface AnalyticsPayload {
  page: string;
  timestamp: string;
  session_id: string;
  referrer: string;
  is_return_visit: boolean;
  device_type: "mobile" | "tablet" | "desktop";
  screen_width: number;
  duration_ms?: number;
  scroll_depth_pct?: number;
  click?: string;
}

// ============================================================
// Track
// ============================================================

export function trackClick(label: string) {
  track(window.location.href, { click: label });
}

export function track(page: string, extras: Partial<Pick<AnalyticsPayload, "duration_ms" | "scroll_depth_pct" | "click">> & { referrer?: string } = {}) {
  if (!ANALYTICS_ENDPOINT || ANALYTICS_ENDPOINT.includes("your-project")) return;

  const { referrer: customReferrer, ...rest } = extras;

  const payload: AnalyticsPayload = {
    page: page.startsWith("http") ? page : window.location.origin + page,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    referrer: customReferrer ?? document.referrer,
    is_return_visit: markReturnVisit(),
    device_type: deviceType(),
    screen_width: window.innerWidth,
    ...rest,
  };

  // sendBeacon with a plain string avoids CORS preflight (text/plain is a "simple" request)
  // Your edge function should read the body as text and JSON.parse it
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
  } else {
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}
