"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import Toast from "@/app/components/Toast";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// App-wide toast, for confirmations that must outlive the component that triggered them
// (e.g. TodoDetail, which unmounts the moment it closes).
export function ToastProvider({ children }: { children: ReactNode }) {
  // The id changes on every popup so <Toast key=...> remounts and restarts its 5-second timer,
  // even when the same message repeats back to back.
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast key={toast.id} message={toast.message} onDismiss={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
