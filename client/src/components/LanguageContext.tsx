import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "de" | "en";

interface Translations {
  [key: string]: { de: string; en: string };
}

const translations: Translations = {
  home: { de: "Start", en: "Home" },
  archive: { de: "Archiv", en: "Archive" },
  projects: { de: "Projekte", en: "Projects" },
  contact: { de: "Kontakt", en: "Contact" },
  impressum: { de: "Impressum", en: "Imprint" },
  cv: { de: "Lebenslauf", en: "CV" },
  recent: { de: "Aktuell", en: "Recent" },
  search: { de: "Suche", en: "Search" },
  newsletter: { de: "Newsletter", en: "Newsletter" },
  loading: { de: "Laden...", en: "Loading..." },
  noImages: { de: "Keine Bilder", en: "No images" },
  clickToEnlarge: { de: "Klicken zum Vergrößern", en: "Click to enlarge" },
  close: { de: "Schließen", en: "Close" },
  previous: { de: "Zurück", en: "Previous" },
  next: { de: "Weiter", en: "Next" },
  send: { de: "Senden", en: "Send" },
  messageSent: { de: "Nachricht gesendet!", en: "Message sent!" },
  name: { de: "Name", en: "Name" },
  email: { de: "E-Mail", en: "Email" },
  message: { de: "Nachricht", en: "Message" },
  subscribe: { de: "Abonnieren", en: "Subscribe" },
  exhibitions: { de: "Ausstellungen", en: "Exhibitions" },
  year: { de: "Jahr", en: "Year" },
  location: { de: "Ort", en: "Location" },
  backToTop: { de: "Nach oben", en: "Back to top" },
  admin: { de: "Admin", en: "Admin" },
  login: { de: "Anmelden", en: "Login" },
  logout: { de: "Abmelden", en: "Logout" },
  save: { de: "Speichern", en: "Save" },
  delete: { de: "Löschen", en: "Delete" },
  edit: { de: "Bearbeiten", en: "Edit" },
  add: { de: "Hinzufügen", en: "Add" },
  cancel: { de: "Abbrechen", en: "Cancel" },
  title: { de: "Titel", en: "Title" },
  description: { de: "Beschreibung", en: "Description" },
  leaveMessage: { de: "Nachricht hinterlassen", en: "Leave a message" },
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
    return (saved === "de" || saved === "en") ? saved : "de";
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
