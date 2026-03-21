import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginCustomer, logoutCustomer, getCustomer, registerCustomer, ShopifyCustomer } from "@/lib/shopifyCustomer";

interface AuthContextType {
  customer: ShopifyCustomer | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "shopify_customer_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      getCustomer(token)
        .then((c) => {
          if (c) { setCustomer(c); setAccessToken(token); }
          else localStorage.removeItem(TOKEN_KEY);
        })
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokenData = await loginCustomer(email, password);
    const token = tokenData.accessToken;
    localStorage.setItem(TOKEN_KEY, token);
    setAccessToken(token);
    const c = await getCustomer(token);
    setCustomer(c);
  }, []);

  const register = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => {
    await registerCustomer(data);
    await login(data.email, data.password);
  }, [login]);

  const logout = useCallback(async () => {
    if (accessToken) {
      await logoutCustomer(accessToken).catch(() => {});
      localStorage.removeItem(TOKEN_KEY);
      setAccessToken(null);
      setCustomer(null);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ customer, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
