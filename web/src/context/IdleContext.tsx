import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface IdleContextType {
  showModal: boolean;
  onStayActive: () => void;
  countdown: number;
}

const IdleContext = createContext<IdleContextType | null>(null);

interface IdleProviderProps {
  children: React.ReactNode;
  timeout?: number;
  countdownTime?: number;
  onLogout: () => void;
  isAuthenticated: boolean;
}

export const IdleProvider = ({
  children,
  timeout = 60 * 60 * 1000, // time limit of inactivity
  countdownTime = 2 * 60,
  onLogout,
  isAuthenticated, 
}: IdleProviderProps) => {

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(countdownTime);

  const idleTimer = useRef<number>();
  const countdownTimer = useRef<number>();

  const resetIdleTimer = () => {
    // Only set timer if user is authenticated
    if (!isAuthenticated) return;

    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setShowModal(true);
      startCountdown();
    }, timeout);
  };

  const startCountdown = () => {
    setCountdown(countdownTime);

    countdownTimer.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    clearInterval(countdownTimer.current);
  };

  const onStayActive = () => {
    setShowModal(false);
    stopCountdown();
    resetIdleTimer();
  };

  useEffect(() => {
    // Only start tracking if authenticated
    if (!isAuthenticated) {
      // Clean up timers if user logs out
      clearTimeout(idleTimer.current);
      clearInterval(countdownTimer.current);
      setShowModal(false);
      return;
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer.current);
      clearInterval(countdownTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, [isAuthenticated]); // Re-run when auth state changes

  return (
    <IdleContext.Provider value={{ showModal, countdown, onStayActive }}>
      {children}
    </IdleContext.Provider>
  );
};

export const useIdle = () => {
  const ctx = useContext(IdleContext);
  if (!ctx) throw new Error("useIdle must be used inside IdleProvider");
  return ctx;
};