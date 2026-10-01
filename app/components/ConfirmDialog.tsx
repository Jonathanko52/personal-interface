"use client";

import { ReactNode } from "react";

interface ConfirmDialogProps {
  theme: "dark" | "light";
  onDismiss: () => void;
  children: ReactNode;
}

// Backdrop/card/click-outside/stopPropagation wrapper, extracted after the same shape got
// built three separate times (TodoDetail.tsx, StackedJobDetail.tsx, TodoListPage.tsx). The
// message and button row are left to each caller as children — only the wrapper mechanics
// and the two color themes are shared here.
const CARD_THEME: Record<"dark" | "light", string> = {
  dark: "bg-slate-900 border-slate-700",
  light: "bg-white border-zinc-200",
};

export default function ConfirmDialog({ theme, onDismiss, children }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onDismiss}>
      <div
        className={`${CARD_THEME[theme]} border rounded-lg p-5 flex flex-col gap-4 max-w-sm w-full mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
