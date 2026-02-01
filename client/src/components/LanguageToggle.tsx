import { useLanguage } from "../contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      className="fixed top-4 right-4 z-50 font-mono text-sm lowercase flex items-center" 
      data-testid="language-toggle"
    >
      <button
        onClick={() => setLanguage("en")}
        className={`${language === "en" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
        data-testid="button-lang-en"
      >
        en
      </button>
      <span className="text-gray-400 mx-1">/</span>
      <button
        onClick={() => setLanguage("de")}
        className={`${language === "de" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
        data-testid="button-lang-de"
      >
        de
      </button>
    </div>
  );
}
