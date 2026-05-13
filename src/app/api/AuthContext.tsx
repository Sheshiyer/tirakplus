import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, SessionService, UserRole } from "./session";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string) => Promise<void>;
  verify: (email: string, code: string, role?: Extract<UserRole, "traveller" | "companion">) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: Extract<UserRole, "traveller" | "companion">) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    SessionService.getSession()
      .then((sess) => {
        setSession(sess);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await SessionService.requestLogin({ email });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async (email: string, code: string, role?: Extract<UserRole, "traveller" | "companion">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SessionService.verifyCode({ email, code, role });
      setSession(response.session);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Verification failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SessionService.logout();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: Extract<UserRole, "traveller" | "companion">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SessionService.switchRole(role);
      setSession(response.session);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Role switch failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, error, login, verify, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
