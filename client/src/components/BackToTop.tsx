import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function BackToTop() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-50 font-mono text-sm lowercase text-black hover:text-gray-600 transition-colors flex items-center gap-1"
      aria-label="Back to top"
      data-testid="button-back-to-top"
    >
      <span>↑</span>
      <span>{t("backToTop")}</span>
    </button>
  );
}
