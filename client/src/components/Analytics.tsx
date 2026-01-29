import { useEffect } from "react";
import { useLocation } from "wouter";

export function Analytics() {
  const [location] = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent !== "accepted") return;

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: location,
        referrer: document.referrer || "",
      }),
    }).catch(() => {});
  }, [location]);

  return null;
}
