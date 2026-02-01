import { useState, useEffect } from "react";

const ADMIN_PASSWORD_KEY = "admin_password";

export function useAdminAuth() {
  const [password, setPassword] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (password) {
      verifyPassword(password);
    }
  }, [password]);

  const verifyPassword = async (pwd: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const result = response.ok;
      setIsAuthenticated(result);
      return result;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = async (pwd: string): Promise<boolean> => {
    const success = await verifyPassword(pwd);
    if (success) {
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, pwd);
      setPassword(pwd);
    }
    return success;
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setPassword(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    password,
    login,
    logout,
  };
}
