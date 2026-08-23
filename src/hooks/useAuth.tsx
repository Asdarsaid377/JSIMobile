import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { registerUnauthorizedHandler } from "@/lib/api/client";
import { clearSession, getSession, setSession } from "@/lib/api/token";
import type { AuthUser, Session } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSessionState] = useState<Session | null>(null);

  useEffect(() => {
    getSession()
      .then((stored) => {
        setSessionState(stored);
        setStatus(stored ? "authenticated" : "unauthenticated");
      })
      .catch((error: unknown) => {
        console.error("[hooks/useAuth/bootstrap]", error);
        setStatus("unauthenticated");
      });
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      void logout();
    });
    return () => registerUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(token: string, user: AuthUser): Promise<void> {
    await setSession(token, user);
    setSessionState({ token, user });
    setStatus("authenticated");
  }

  async function logout(): Promise<void> {
    await clearSession();
    setSessionState(null);
    setStatus("unauthenticated");
  }

  return <AuthContext.Provider value={{ status, session, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return ctx;
}
