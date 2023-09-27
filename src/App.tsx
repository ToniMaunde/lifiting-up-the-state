import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, MouseEvent, SetStateAction } from "react";

type TTodo = {
  text: string;
  done: boolean;
  id: string;
  creationDate: string;
}

function Todo({ todo }: { todo: TTodo }) {

  function handleTodoChange() {

    console.log("clicked")
    // changeTodoStatus(newStatus);
  }

  return (
    <li
      className="flex gap-2 items-center"
    >
      <input 
        className="w-6 h-6 accent-purple-500"
        type="checkbox"
        checked={todo.done}
        value={todo.id}
        onChange={handleTodoChange}
      />
      <section>
        <p className="font-bold font-mono text-lg">
          {todo.text}
        </p>
        <small>
          {todo.creationDate}
        </small>
      </section>
      <button
        className="bg-red-200 h-fit py-1 px-2 ml-auto rounded-sm hover:bg-red-100"
        title="Remove todo"
      >
        ❌
      </button>
    </li>
  )
}

type TTodoFilter = "all" | "done" | "not done";

type TSegmentedButton<T> = {
  values: string[];
  currentFilterValue: T;
  handler: Dispatch<SetStateAction<T>>;
}

function SegmentedButton(props: TSegmentedButton<TTodoFilter>) {

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const newFilterValue = e.currentTarget.value as TTodoFilter;

    props.handler(newFilterValue);
  }

  return (
    <ul
      className="grid grid-cols-3 mx-auto mb-4 p-1 w-fit border border-t-gray-300 rounded-lg"
    >
      {
        props.values.map(value => (
          <li
            key={value}
          >
            <button
              value={value}
              className={props.currentFilterValue === value ? "w-full bg-white text-black rounded p-1 text-center" : "w-full text-center rounded p-1"}
              onClick={handleClick}
            >
              {value}
            </button>
          </li>
        ))
      }
    </ul>
  )
}

type TSortOrder = "asc" | "desc";
type TLayout = "list" | "grid";

function TodoList({ todos }: { todos: TTodo[] }) {
  const [sortOrder, setOrder] = useState<TSortOrder>("asc");
  const [layout, setLayout] = useState<TLayout>("list");
  const [filter, setFilter] = useState<TTodoFilter>("all");

  /* useEffect(() => {
    const params = new URLSearchParams(location.search);

    params.set("sortOrder", sortOrder);
    params.set("layout", layout);
    params.set("filter", filter);

    window.history.replaceState({}, "", `${location.pathname}?${params}`);
  }, [sortOrder, layout, filter]) */

  // add, edit and remove todos as well as sort, filter and display them as list or grid

  function filterTodos(list: TTodo[], filter: TTodoFilter): TTodo[] {
    if (filter === "done") {
      return list.filter(element => element.done === true);
    } else if (filter === "not done") {
      return list.filter(element => element.done === false);
    }

    return list;
  }

  const listToRender = filterTodos(todos, filter);
  const thereAreTodos = listToRender;

  return (
    <>
      <SegmentedButton
        values={["all", "done", "not done"]}
        currentFilterValue={filter}
        handler={setFilter}
      />
      {
        thereAreTodos
          ? <ul className="grid gap-1">
            {
              listToRender.map((todo, idx) => (
                <Todo
                  key={`${todo.creationDate}${idx}`}
                  todo={todo}
                />
              ))
            }
          </ul>
          : <p>
            There are no todos. Start adding.
          </p>
      }
    </>
  )
}

function App() {
  const [listOfTodos, setList] = useState<TTodo[]>([]);
  const todoRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const todoText = formData.get("todo") as string;
    const creationDate = new Date().toLocaleDateString();
    const id = `${creationDate}id${listOfTodos.length}`
    const newTodo: TTodo = { text: todoText, done: false, id, creationDate };

    setList(prev => [...prev, newTodo]);
    (todoRef.current as HTMLInputElement).value = "";
  }

  return (
    <main
      className="w-[40vw] mx-auto p-8"
    >
      <h1
        className="text-white text-2xl font-bold mb-8"
      >
        Todo app with just useState()
      </h1>
      <form
        method="post"
        onSubmit={handleSubmit}
      >
        <label
          htmlFor="todoText"
          className="block mb-2"
        >
          Add a new todo
        </label>
        <div
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            id="todoText"
            name="todo"
            ref={todoRef}
            className="w-full h-full py-2 px-1 rounded-sm text-black"
            required
            autoFocus
            autoComplete="off"
          />
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded-sm"
          >
            Add
          </button>
        </div>
      </form>
      <TodoList todos={listOfTodos} />
    </main>
  )
}

export default App
