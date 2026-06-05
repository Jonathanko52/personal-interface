export const lists = [
  { id: "1", name: "Work", color: "#6366f1" },
  { id: "2", name: "Personal", color: "#22c55e" },
  { id: "3", name: "Shopping", color: "#f59e0b" },
];

export const tags = [
  { id: "1", name: "urgent", color: "#ef4444" },
  { id: "2", name: "later", color: "#94a3b8" },
];

export const todos = [
  { id: "1", title: "Review project proposal", priority: "high", dueDate: "2026-06-06", completed: false, listId: "1", tagIds: ["1"] },
  { id: "2", title: "Buy groceries", priority: "low", dueDate: "2026-06-05", completed: false, listId: "3", tagIds: [] },
  { id: "3", title: "Schedule dentist appointment", priority: "medium", dueDate: "2026-06-07", completed: false, listId: "2", tagIds: ["2"] },
  { id: "4", title: "Read chapter 3", priority: "none", dueDate: null, completed: true, listId: "2", tagIds: ["2"] },
];
