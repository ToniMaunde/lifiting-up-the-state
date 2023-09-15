import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, MouseEvent, SetStateAction } from "react";

type TTodo = {
  text: string;
  done: boolean;
  creationDate: string;
}

function Todo(props: TTodo) {
  return (
    <li>
      <p>
        {props.text}
      </p>
      <span>
        {props.done ? "done" : "not done"}
      </span>
      <small>
        {props.creationDate}
      </small>
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
      className="grid grid-cols-3 p-1 w-fit border border-t-gray-300 rounded-lg"
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    params.set("sortOrder", sortOrder);
    params.set("layout", layout);
    params.set("filter", filter);

    window.history.replaceState({}, "", `${location.pathname}?${params}`);
  }, [sortOrder, layout, filter])

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
          ? <ul>
            {
              listToRender.map((todo, idx) => (
                <Todo
                  key={`${todo.creationDate}${idx}`}
                  {...todo}
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
    const newTodo: TTodo = { text: todoText, done: false, creationDate: new Date().toLocaleDateString() };

    setList(prev => [...prev, newTodo]);
    (todoRef.current as HTMLInputElement).value = "";
  }

  return (
    <>
      <h1
        className="text-white text-2xl font-bold mb-8"
      >
        Todo app with just useState()
      </h1>
      <form
        method="post"
        onSubmit={handleSubmit}
      >
        <h2
          className="text-lg mb-4"
        >
          Add a new todo
        </h2>
        <label
          htmlFor="todoText"
          className="block mb-2"
        >
          Todo
        </label>
        <div>
          <input
            type="text"
            id="todoText"
            name="todo"
            required
            autoFocus
            ref={todoRef}
            className="h-full py-2 px-1 mr-2 rounded-sm text-black"
          />
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded-sm"
          >
            Add
          </button>
        </div>
      </form>
      <div>
        <h2>
          List of todos
        </h2>
        <TodoList todos={listOfTodos} />
      </div>
    </>
  )
}

export default App
