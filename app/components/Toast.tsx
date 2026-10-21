"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  // Makes the whole toast clickable (e.g. the unfinished-day warning, which navigates).
  onClick?: () => void;
  // Stays until handled: no auto-dismiss timer, no outside-click dismissal, and a ✕ to close.
  persistent?: boolean;
  variant?: "default" | "warning";
}

const TOAST_DURATION_MS = 5000;

const VARIANT_STYLES = {
  default: "bg-white text-black border-zinc-200",
  warning: "bg-amber-50 text-amber-900 border-amber-300",
};

// Positioning lives in ToastProvider's container, so a warning and a transient toast can stack.
export default function Toast({ message, onDismiss, onClick, persistent = false, variant = "default" }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Parents typically pass a fresh inline closure every render; reading it through a ref keeps
  // the timer and listener below from restarting each time the parent re-renders.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (persistent) return;
    const timer = setTimeout(() => onDismissRef.current(), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, persistent]);

  // pointerdown, not click: the click that triggered the success has already finished its
  // pointerdown by the time this mounts, so it can't dismiss its own popup.
  useEffect(() => {
    if (persistent) return;
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismissRef.current();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [persistent]);

  return (
    <div
      ref={ref}
      role={variant === "warning" ? "alert" : "status"}
      onClick={onClick}
      className={`flex items-center gap-3 text-sm border rounded-md shadow-lg px-4 py-3 ${VARIANT_STYLES[variant]} ${onClick ? "cursor-pointer hover:shadow-xl transition-shadow" : ""}`}
    >
      <span>{message}</span>
      {persistent && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // closing shouldn't also trigger the toast's own onClick
            onDismiss();
          }}
          aria-label="Dismiss"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
