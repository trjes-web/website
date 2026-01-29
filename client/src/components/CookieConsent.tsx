import { useState, useEffect } from "react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50"
      data-testid="cookie-consent-banner"
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs lowercase text-center sm:text-left">
          this website uses cookies for anonymous page view statistics. no personal data is collected.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="border border-black px-3 py-1 font-mono text-xs lowercase hover:bg-gray-100"
            data-testid="button-cookie-decline"
          >
            decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-black text-white px-3 py-1 font-mono text-xs lowercase hover:bg-gray-800"
            data-testid="button-cookie-accept"
          >
            accept
          </button>
        </div>
      </div>
    </div>
  );
}
