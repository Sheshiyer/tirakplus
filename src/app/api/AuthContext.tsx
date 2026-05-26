import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MuseService, museTranscriptStorageKey } from "./muse";
import { Session, SessionService, UserRole } from "./session";
import type { MuseTranscriptSnapshot } from "../../shared/contracts";

/**
 * Move any pre-auth Muse transcripts stored in localStorage (keyed by
 * `museTranscript:<conversationId>`) into the user's account via
 * MuseService.adopt(). On success, remove the local copy so subsequent
 * sessions don't re-upload. Silent on failure — we never block sign-in.
 */
async function adoptPendingMuseTranscripts(csrfToken: string | undefined): Promise<void> {
  if (typeof window === "undefined") return;
  if (!csrfToken) return;
  const indexKey = "museTranscript:pendingIds";
  let pendingIds: string[] = [];
  try {
    const raw = window.localStorage.getItem(indexKey);
    pendingIds = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    pendingIds = [];
  }
  if (pendingIds.length === 0) return;

  const adopted: string[] = [];
  for (const conversationId of pendingIds) {
    try {
      const raw = window.localStorage.getItem(museTranscriptStorageKey(conversationId));
      if (!raw) {
        adopted.push(conversationId);
        continue;
      }
      const snapshot = JSON.parse(raw) as MuseTranscriptSnapshot;
      await MuseService.adopt(snapshot, csrfToken);
      window.localStorage.removeItem(museTranscriptStorageKey(conversationId));
      adopted.push(conversationId);
    } catch {
      // Leave the snapshot in localStorage; next verify() attempts again.
    }
  }

  // Rewrite the pending index without the ones we successfully adopted.
  try {
    const remaining = pendingIds.filter((id) => !adopted.includes(id));
    if (remaining.length === 0) {
      window.localStorage.removeItem(indexKey);
    } else {
      window.localStorage.setItem(indexKey, JSON.stringify(remaining));
    }
  } catch {
    // ignore
  }
}

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
      // Fire-and-forget: move any pre-auth Muse transcripts into the
      // account. Failures here never block sign-in; the index in
      // localStorage will be retried on the next verify().
      void adoptPendingMuseTranscripts(response.csrfToken ?? response.session.csrfToken);
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
