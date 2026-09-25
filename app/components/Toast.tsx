"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

const TOAST_DURATION_MS = 5000;

export default function Toast({ message, onDismiss }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Parents typically pass a fresh inline closure every render; reading it through a ref keeps
  // the timer and listener below from restarting each time the parent re-renders.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message]);

  // pointerdown, not click: the click that triggered the success has already finished its
  // pointerdown by the time this mounts, so it can't dismiss its own popup.
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismissRef.current();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-black text-sm border border-zinc-200 rounded-md shadow-lg px-4 py-3"
    >
      {message}
    </div>
  );
}
