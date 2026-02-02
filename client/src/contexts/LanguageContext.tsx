import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "de" | "en";

interface Translations {
  [key: string]: { de: string; en: string };
}

const translations: Translations = {
  home: { de: "start", en: "home" },
  archive: { de: "archiv", en: "archive" },
  projects: { de: "projekte", en: "projects" },
  contact: { de: "kontakt", en: "contact" },
  impressum: { de: "impressum", en: "imprint" },
  cv: { de: "CV", en: "CV" },
  recent: { de: "aktuell", en: "recent" },
  search: { de: "suche", en: "search" },
  newsletter: { de: "newsletter", en: "newsletter" },
  loading: { de: "laden...", en: "loading..." },
  noImages: { de: "keine bilder", en: "no images" },
  clickToEnlarge: { de: "klicken zum vergrößern", en: "click to enlarge" },
  close: { de: "schließen", en: "close" },
  previous: { de: "zurück", en: "previous" },
  next: { de: "weiter", en: "next" },
  send: { de: "senden", en: "send" },
  messageSent: { de: "nachricht gesendet!", en: "message sent!" },
  name: { de: "name", en: "name" },
  email: { de: "e-mail", en: "email" },
  message: { de: "nachricht", en: "message" },
  subscribe: { de: "abonnieren", en: "subscribe" },
  exhibitions: { de: "ausstellungen", en: "exhibitions" },
  year: { de: "jahr", en: "year" },
  location: { de: "ort", en: "location" },
  backToTop: { de: "Nach oben", en: "Back to top" },
  admin: { de: "admin", en: "admin" },
  login: { de: "anmelden", en: "login" },
  logout: { de: "abmelden", en: "logout" },
  save: { de: "speichern", en: "save" },
  delete: { de: "löschen", en: "delete" },
  edit: { de: "bearbeiten", en: "edit" },
  add: { de: "hinzufügen", en: "add" },
  cancel: { de: "abbrechen", en: "cancel" },
  title: { de: "titel", en: "title" },
  description: { de: "beschreibung", en: "description" },
  leaveMessage: { de: "nachricht hinterlassen", en: "leave a message" },
  saySomething: { de: "kommentieren", en: "comment" },
  backToHome: { de: "zurück zur startseite", en: "back to home" },
  noRecentEntries: { de: "keine aktuellen einträge", en: "no recent entries" },
  noProjectsYet: { de: "noch keine projekte.", en: "no projects yet." },
  noArchiveEntries: { de: "noch keine archiveinträge.", en: "no archive entries yet." },
  noResultsFound: { de: "keine ergebnisse gefunden.", en: "no results found." },
  searchArchive: { de: "archiv durchsuchen...", en: "search archive..." },
  viewFloorPlan: { de: "raumplan / text ansehen →", en: "view floor plan / text →" },
  impressumTitle: { de: "impressum / Rechtliche Hinweise", en: "Impressum / Legal Notice" },
  legalNotice: { de: "impressum / rechtliche hinweise", en: "imprint / legal notice" },
  subscribeSuccess: { de: "erfolgreich abonniert!", en: "successfully subscribed!" },
  enterEmail: { de: "e-Mail eingeben", en: "enter email" },
  alreadySubscribed: { de: "bereits abonniert", en: "already subscribed" },
  impressumDefault: { de: "impressum-inhalt wird hier eingefügt.", en: "impressum content will be added here." },
  connectionError: { de: "verbindungsfehler", en: "connection error" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "de" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
