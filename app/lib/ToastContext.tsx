"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import Toast from "@/app/components/Toast";

interface Warning {
  id: string;
  message: string;
  onClick: () => void;
  // Runs when the user removes the warning (✕ or clicking it), not when code calls dismissWarning,
  // so a caller can tell "the user handled it" apart from "the condition cleared".
  onDismiss?: () => void;
}

interface ToastContextValue {
  showToast: (message: string) => void;
  // Persistent, clickable warnings, keyed by id so several can show at once (e.g. the
  // unfinished-day and due-today warnings), and transient toasts never replace them.
  // Showing an id that's already up updates it in place.
  showWarning: (id: string, message: string, onClick: () => void, onDismiss?: () => void) => void;
  dismissWarning: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// App-wide toast, for confirmations that must outlive the component that triggered them
// (e.g. TodoDetail, which unmounts the moment it closes).
export function ToastProvider({ children }: { children: ReactNode }) {
  // The id changes on every popup so <Toast key=...> remounts and restarts its 5-second timer,
  // even when the same message repeats back to back.
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const showToast = useCallback((message: string) => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message }));
  }, []);

  const showWarning = useCallback(
    (id: string, message: string, onClick: () => void, onDismiss?: () => void) => {
      setWarnings((prev) => {
        const next = { id, message, onClick, onDismiss };
        return prev.some((w) => w.id === id) ? prev.map((w) => (w.id === id ? next : w)) : [...prev, next];
      });
    },
    []
  );

  const dismissWarning = useCallback((id: string) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Stable across toast state changes, so useToast() consumers don't re-render on every popup.
  const value = useMemo<ToastContextValue>(
    () => ({ showToast, showWarning, dismissWarning }),
    [showToast, showWarning, dismissWarning]
  );

  function removeByUser(warning: Warning) {
    dismissWarning(warning.id);
    warning.onDismiss?.();
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {(warnings.length > 0 || toast) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {warnings.map((warning) => (
            <Toast
              key={warning.id}
              message={warning.message}
              variant="warning"
              persistent
              onClick={() => {
                warning.onClick();
                removeByUser(warning);
              }}
              onDismiss={() => removeByUser(warning)}
            />
          ))}
          {toast && <Toast key={toast.id} message={toast.message} onDismiss={() => setToast(null)} />}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
