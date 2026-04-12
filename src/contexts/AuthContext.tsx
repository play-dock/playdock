import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getCurrentUser, signIn, signUp, signOut, type UserProfile } from "@/lib/store";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (phone: string, password: string) => void;
  register: (name: string, phone: string, password: string) => void;
  logout: () => void;
  error: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  error: "",
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [error, setError] = useState("");

  const login = useCallback((phone: string, password: string) => {
    try {
      setError("");
      const u = signIn(phone, password);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const register = useCallback((name: string, phone: string, password: string) => {
    try {
      setError("");
      const u = signUp(name, phone, password);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, isAdmin: user?.role === "admin", login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}
