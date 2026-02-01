import { useState, useEffect } from "react";

const ADMIN_PASSWORD_KEY = "admin_password";

interface LoginResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  requiresCode?: boolean;
  attemptsRemaining?: number;
}

export function useAdminAuth() {
  const [password, setPassword] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [requiresCode, setRequiresCode] = useState(false);

  useEffect(() => {
    if (password) {
      verifyPassword(password);
    }
  }, []);

  const verifyPassword = async (pwd: string, unlockCode?: string): Promise<LoginResult> => {
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd, unlockCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsAuthenticated(true);
        setIsLocked(false);
        setRequiresCode(false);
        return { success: true };
      }
      
      if (response.status === 423 || data.locked) {
        setIsLocked(true);
        setRequiresCode(data.requiresCode || false);
      }
      
      setIsAuthenticated(false);
      return { 
        success: false, 
        error: data.error,
        locked: data.locked,
        requiresCode: data.requiresCode,
        attemptsRemaining: data.attemptsRemaining
      };
    } catch {
      setIsAuthenticated(false);
      return { success: false, error: "Connection error" };
    }
  };

  const login = async (pwd: string, unlockCode?: string): Promise<LoginResult> => {
    const result = await verifyPassword(pwd, unlockCode);
    if (result.success) {
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, pwd);
      setPassword(pwd);
    }
    return result;
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setPassword(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    password,
    isLocked,
    requiresCode,
    login,
    logout,
  };
}
