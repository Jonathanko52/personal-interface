"use client";

import { ReactNode } from "react";
import ConfirmDialog from "./ConfirmDialog";

interface ConfirmDeleteDialogProps {
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// The light-theme "Cancel / red action" confirmation, shared by the destructive bulk/remove
// actions (TodoListPage's Clear, the Jobs Stack's Clear all and Remove). Save/Discard prompts
// (TodoDetail, StackedJobDetail) use ConfirmDialog directly with their own buttons.
export default function ConfirmDeleteDialog({ message, confirmLabel, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <ConfirmDialog theme="light" onDismiss={onCancel}>
      <p className="text-sm text-zinc-700">{message}</p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-2 py-1.5">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="text-xs bg-red-500 text-white rounded-md px-3 py-1.5 hover:bg-red-600 transition-colors">
          {confirmLabel}
        </button>
      </div>
    </ConfirmDialog>
  );
}
