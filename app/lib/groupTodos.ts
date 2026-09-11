import { Todo } from "./DataContext";

export function isDailyTodo<T extends Pick<Todo, "repeatDays">>(todo: T): boolean {
  return !!todo.repeatDays?.length;
}

export function groupByRepeat<T extends Pick<Todo, "repeatDays">>(todos: T[]): { repeating: T[]; oneOff: T[] } {
  const repeating: T[] = [];
  const oneOff: T[] = [];
  for (const t of todos) {
    (isDailyTodo(t) ? repeating : oneOff).push(t);
  }
  return { repeating, oneOff };
}
