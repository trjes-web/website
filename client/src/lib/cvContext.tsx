import { createContext, useContext, useState, ReactNode } from "react";

interface CVContextType {
  isOpen: boolean;
  openCV: () => void;
  closeCV: () => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export function CVProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CVContext.Provider 
      value={{
        isOpen,
        openCV: () => setIsOpen(true),
        closeCV: () => setIsOpen(false),
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within a CVProvider");
  }
  return context;
}
