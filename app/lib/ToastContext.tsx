"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import Toast from "@/app/components/Toast";

interface ToastContextValue {
  showToast: (message: string) => void;
  // A persistent, clickable warning in its own slot, so transient toasts never replace it.
  showWarning: (message: string, onClick: () => void) => void;
  dismissWarning: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// App-wide toast, for confirmations that must outlive the component that triggered them
// (e.g. TodoDetail, which unmounts the moment it closes).
export function ToastProvider({ children }: { children: ReactNode }) {
  // The id changes on every popup so <Toast key=...> remounts and restarts its 5-second timer,
  // even when the same message repeats back to back.
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [warning, setWarning] = useState<{ message: string; onClick: () => void } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message }));
  }, []);

  const showWarning = useCallback((message: string, onClick: () => void) => {
    setWarning({ message, onClick });
  }, []);

  const dismissWarning = useCallback(() => setWarning(null), []);

  // Stable across toast state changes, so useToast() consumers don't re-render on every popup.
  const value = useMemo<ToastContextValue>(
    () => ({ showToast, showWarning, dismissWarning }),
    [showToast, showWarning, dismissWarning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {(warning || toast) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {warning && (
            <Toast
              message={warning.message}
              variant="warning"
              persistent
              onClick={() => {
                warning.onClick();
                setWarning(null);
              }}
              onDismiss={() => setWarning(null)}
            />
          )}
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
