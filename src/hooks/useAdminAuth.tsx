import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { adminFetch, clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin";

interface AdminAuthContextType {
  token: string | null;
  loading: boolean;
  authenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  validate: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  token: null,
  loading: true,
  authenticated: false,
  signIn: () => {},
  signOut: () => {},
  validate: async () => false,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = getAdminToken();
    setToken(existing);
    setLoading(false);
  }, []);

  const signIn = (nextToken: string) => {
    setAdminToken(nextToken);
    setToken(nextToken);
  };

  const signOut = () => {
    clearAdminToken();
    setToken(null);
  };

  const validate = async () => {
    if (!token) return false;
    try {
      await adminFetch({ action: "validate" });
      return true;
    } catch {
      signOut();
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ token, loading, authenticated: !!token, signIn, signOut, validate }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
