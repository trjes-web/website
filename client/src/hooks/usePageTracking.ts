import { useEffect } from "react";
import { useLocation } from "wouter";

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/pageview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: location || "/",
            referrer: document.referrer || "",
          }),
        });
      } catch (error) {
        // Silently fail - analytics should not affect user experience
      }
    };

    trackPageView();
  }, [location]);
}
