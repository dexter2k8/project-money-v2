import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { RefreshSession, SignOut } from "../services/fetchers/auth";
import type { PropsWithChildren } from "react";

const CHECK_INTERVAL = 1000; // 1 second
const EXPIRING_SOON_THRESHOLD = 60; // 1 minute
const ACTIVITY_THRESHOLD = 5 * 60; // 5 minutes
const ACTIVITY_EVENTS = ["click", "keydown", "scroll", "touchstart"];

interface ISessionTimerContextProps {
  remainingSeconds: number;
  refreshSession: () => Promise<void>;
  isExpiringSoon: boolean;
  isLoading: boolean;
}

const SessionTimerContext = createContext<ISessionTimerContextProps | null>(null);

export function SessionTimerProvider({ children }: PropsWithChildren) {
  const { selfUser } = useAuth();
  const expiresAtRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSigningOutRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const lastActivityRef = useRef<number>(0);

  const calculateRemaining = useCallback(() => {
    const diff = expiresAtRef.current - Date.now();
    return Math.max(Math.floor(diff / 1000), 0);
  }, []);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    const response = await RefreshSession();
    if (!response) return;
    expiresAtRef.current = response.exp * 1000;
    isSigningOutRef.current = false;
    setRemainingSeconds(calculateRemaining());
  }, [calculateRemaining]);

  const isExpiringSoon = remainingSeconds > 0 && remainingSeconds <= EXPIRING_SOON_THRESHOLD;

  const handleSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    const result = await SignOut();
    if (result) {
      const params = new URLSearchParams(window.location.search);
      params.delete("returnTo");
      const query = params.toString();
      const returnTo = encodeURIComponent(window.location.pathname + (query ? `?${query}` : ""));
      window.location.href = `/?returnTo=${returnTo}`;
    }
  }, []);

  // Sign out when session expires
  useEffect(() => {
    if (remainingSeconds === 0 && isInitializedRef.current) {
      handleSignOut();
    }
  }, [remainingSeconds, handleSignOut]);

  // Update remaining seconds
  useEffect(() => {
    if (!selfUser?.exp) return;

    expiresAtRef.current = selfUser.exp * 1000;

    queueMicrotask(() => {
      isInitializedRef.current = true;
      setRemainingSeconds(calculateRemaining());
      setIsLoading(false);
    });

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(calculateRemaining());
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selfUser?.exp, calculateRemaining]);

  // Update last activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [refreshSession]);

  // Renew session if user is interacting with the page last 5 minutes before expiring
  useEffect(() => {
    //tempo decorrido desde a ultima interação (em segundos)
    const diff = (Date.now() - lastActivityRef.current) / 1000;
    const lastActivity = Math.max(Math.floor(diff), 0);

    // faltando menos de 5 minutos para completar 1 hora de sessão, permite renovar
    const wasExpiringSoon =
      remainingSeconds > EXPIRING_SOON_THRESHOLD && remainingSeconds <= ACTIVITY_THRESHOLD;

    // se a última interação ocorreu há menos de 5 minutos, permite renovar
    const wasActive = lastActivity < ACTIVITY_THRESHOLD;

    if (wasActive && wasExpiringSoon) {
      refreshSession();
    }
  }, [remainingSeconds, refreshSession]);

  const values = { remainingSeconds, refreshSession, isExpiringSoon, isLoading };

  return <SessionTimerContext.Provider value={values}>{children}</SessionTimerContext.Provider>;
}

export const useSessionTimer = () => {
  const context = useContext(SessionTimerContext);
  if (!context) {
    throw new Error("useSessionTimer must be used within a SessionTimerProvider");
  }
  return context;
};
