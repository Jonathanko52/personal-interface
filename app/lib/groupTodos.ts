import { Todo } from "./DataContext";

export function groupByRepeat<T extends Pick<Todo, "repeatDays">>(todos: T[]): { repeating: T[]; oneOff: T[] } {
  const repeating: T[] = [];
  const oneOff: T[] = [];
  for (const t of todos) {
    (t.repeatDays?.length ? repeating : oneOff).push(t);
  }
  return { repeating, oneOff };
}
