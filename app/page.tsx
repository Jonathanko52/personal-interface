import TodoList from "./components/TodoList";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Today</h1>
      <TodoList />
    </div>
  );
}
