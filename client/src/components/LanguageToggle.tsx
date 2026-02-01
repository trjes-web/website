import { useLanguage } from "../contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="font-mono text-xs flex gap-1 items-center" data-testid="language-toggle">
      <button
        onClick={() => setLanguage("de")}
        className={`px-1 ${language === "de" ? "underline font-bold" : "text-gray-500 hover:text-black"}`}
        data-testid="button-lang-de"
      >
        de
      </button>
      <span className="text-gray-400">/</span>
      <button
        onClick={() => setLanguage("en")}
        className={`px-1 ${language === "en" ? "underline font-bold" : "text-gray-500 hover:text-black"}`}
        data-testid="button-lang-en"
      >
        en
      </button>
    </div>
  );
}
