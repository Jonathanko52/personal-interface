"use client";

import { useState } from "react";
import { useData, Todo } from "@/app/lib/DataContext";
import { PRIORITIES, Priority } from "@/app/lib/priority";
import { toggleDay } from "@/app/lib/repeatDays";
import RepeatDayPicker from "./RepeatDayPicker";

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
}

function sameSet(a: (string | number)[], b: (string | number)[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

export default function TodoDetail({ todo, onClose }: TodoDetailProps) {
  const { updateTodo, deleteTodo, tags } = useData();
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes);
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
  const [tagIds, setTagIds] = useState(todo.tagIds);
  const [repeatDays, setRepeatDays] = useState(todo.repeatDays ?? []);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isDirty =
    title !== todo.title ||
    notes !== todo.notes ||
    priority !== todo.priority ||
    (dueDate || null) !== todo.dueDate ||
    !sameSet(tagIds, todo.tagIds) ||
    !sameSet(repeatDays, todo.repeatDays ?? []);

  function commitChanges() {
    updateTodo(todo.id, { title, notes, priority, dueDate: dueDate || null, tagIds, repeatDays });
  }

  function attemptClose() {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }

  function handleSaveAndClose() {
    commitChanges();
    setShowConfirmClose(false);
    onClose();
  }

  function handleDiscardAndClose() {
    setShowConfirmClose(false);
    onClose();
  }

  function handleDelete() {
    deleteTodo(todo.id);
    onClose();
  }

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div
      className="min-h-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) attemptClose();
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-xl font-semibold text-zinc-900 outline-none border-b border-transparent focus:border-zinc-300 pb-1 transition-colors"
            />
            <button
              onClick={commitChanges}
              disabled={!isDirty}
              className="shrink-0 text-xs bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={attemptClose}
              className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="text-sm text-zinc-700 outline-none border border-zinc-200 rounded-md p-2 resize-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                    priority === p
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Due Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm text-zinc-700 border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-400 transition-colors w-fit"
              />
              {dueDate && (
                <button
                  onClick={() => setDueDate("")}
                  className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  No due date
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tags</label>
            {tags.length === 0 ? (
              <span className="text-xs text-zinc-400">No tags available — create one in Navigation.</span>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => {
                  const active = tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        active ? "text-white border-transparent" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                      }`}
                      style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Repeat</label>
            <RepeatDayPicker
              selectedDays={repeatDays}
              onToggle={(day) => setRepeatDays((prev) => toggleDay(prev, day))}
              variant="light"
            />
          </div>

          <button
            onClick={handleDelete}
            className="self-start text-xs text-red-500 hover:text-red-700 transition-colors mt-2"
          >
            Delete todo
          </button>
        </div>
      </div>

      {showConfirmClose && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowConfirmClose(false)}
        >
          <div
            className="bg-white rounded-lg p-5 flex flex-col gap-4 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-zinc-700">You have unsaved changes. Save them before closing?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-2 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscardAndClose}
                className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1.5"
              >
                Discard
              </button>
              <button
                onClick={handleSaveAndClose}
                className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
