import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/analytics";

export function useAnalytics() {
  const location = useLocation();
  const entryTime = useRef<number>(Date.now());
  const maxScroll = useRef<number>(0);
  const currentPage = useRef<string>(location.pathname);

  // Track scroll depth
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track on route change — send previous page's data, start fresh
  useEffect(() => {
    const page = location.pathname;
    if (page === currentPage.current && entryTime.current !== 0) {
      // Same page on initial mount — just track the entry (use HTTP referrer)
      currentPage.current = page;
      track(page);
      return;
    }

    // Navigated to a new page — record exit stats for the previous page
    track(currentPage.current, {
      duration_ms: Date.now() - entryTime.current,
      scroll_depth_pct: maxScroll.current,
    });

    // Reset for new page, use previous SPA route as referrer
    const previousPage = currentPage.current;
    entryTime.current = Date.now();
    maxScroll.current = 0;
    currentPage.current = page;
    currentPage.current = page;
    track(page, { referrer: window.location.origin + previousPage });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track when tab is hidden or page is unloaded (last page before close)
  useEffect(() => {
    const sendExit = () => {
      track(currentPage.current, {
        duration_ms: Date.now() - entryTime.current,
        scroll_depth_pct: maxScroll.current,
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendExit();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendExit);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendExit);
    };
  }, []);
}
