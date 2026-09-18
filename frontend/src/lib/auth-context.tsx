import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "./types";
import { apiLogin, apiRegister, apiFetchMe } from "./auth-api";
import { toast } from "sonner";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  continueAsGuest: (name?: string) => void;
  logout: () => void;
}

export const AUTH_USER_KEY = "yaduk_auth_user_v1";
export const AUTH_TOKEN_KEY = "yaduk_auth_token_v1";
const LEGACY_USER_KEY = "sarthi_auth_user_v1";
const LEGACY_TOKEN_KEY = "sarthi_auth_token_v1";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
      const savedUserStr = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
      if (savedToken && savedUserStr) {
        const parsedUser: AuthUser = JSON.parse(savedUserStr);
        setUser(parsedUser);
        setToken(savedToken);

        // Only verify with server if it's a real server token (not guest or local)
        if (
          !parsedUser.isGuest &&
          !savedToken.startsWith("local_jwt_") &&
          !savedToken.startsWith("guest_token_")
        ) {
          apiFetchMe(savedToken)
            .then((res) => {
              if (res.user) {
                setUser(res.user);
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
              } else if (res.expired) {
                // Token was explicitly rejected by server with 401
                setUser(null);
                setToken(null);
                try {
                  localStorage.removeItem(AUTH_TOKEN_KEY);
                  localStorage.removeItem(AUTH_USER_KEY);
                } catch {
                  /* ignore */
                }
                toast.error("Your session has expired. Please sign in again.");
              }
              // If res.error (network unavailable), keep the existing user session intact!
            })
            .catch(() => {
              // network offline, retain session
            });
        }
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === AUTH_USER_KEY) {
        if (!e.newValue) {
          setUser(null);
          setToken(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      toast.success(`Welcome, ${res.user.fullName || res.user.email}!`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(email, password, fullName);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      toast.success(`Welcome to Yaduk, ${res.user.fullName}!`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const continueAsGuest = useCallback((name?: string) => {
    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      email: "guest@yaduk.internal",
      fullName: name?.trim() || "Guest Explorer",
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    const guestToken = `guest_token_${Date.now()}`;
    setUser(guestUser);
    setToken(guestToken);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, guestToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    } catch {
      /* ignore */
    }
    toast.info("Exploring in Guest Mode! You can create a permanent account anytime.");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
      localStorage.removeItem("sarthi_auth_token_v1");
      localStorage.removeItem("sarthi_auth_token");
      localStorage.removeItem("sarthi_user_profile");
      localStorage.removeItem("sarthi.journey.v1");
      localStorage.removeItem("questline.journey.v1");
      localStorage.removeItem("yaduk_user_profile");
      localStorage.removeItem("yaduk.journey.v1");
    } catch {
      /* ignore */
    }

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new Event("yaduk:session_cleared"));
        window.dispatchEvent(new Event("sarthi:session_cleared"));
      } catch {
        /* ignore */
      }
    }

    toast.success("Signed out successfully.");
  }, []);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
