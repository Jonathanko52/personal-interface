export const lists: { id: string; name: string; color: string }[] = [];
export const tags: { id: string; name: string; color: string }[] = [];
export const todos: {
  id: string;
  title: string;
  notes: string;
  priority: string;
  dueDate: string | null;
  completed: boolean;
  listId: string;
  tagIds: string[];
}[] = [];
