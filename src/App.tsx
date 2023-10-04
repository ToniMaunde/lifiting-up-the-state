import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ChangeEventHandler, FormEvent, MouseEvent, MouseEventHandler, RefObject } from "react";

type TTodo = {
  text: string;
  done: boolean;
  id: string;
  creationDate: string;
}

type TTodoEditDialogProps = {
  todo: TTodo;
  dialogRef: RefObject<HTMLDialogElement>;
  handleTodoTextChange: (form: HTMLFormElement, ref: RefObject<HTMLDialogElement>) => void;
}

function TodoEditDialog(props: TTodoEditDialogProps) {
  const { todo, dialogRef, handleTodoTextChange } = props;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    handleTodoTextChange(e.currentTarget, dialogRef);
  }

  return (
    <dialog
      ref={dialogRef}
      className="w-[35vw] rounded backdrop:bg-opacity-10"
    >
      <form
        className="p-4"
        onSubmit={handleSubmit}
      >
        <h1>
          Edit Todo
        </h1>
        <input
          type="text"
          defaultValue={todo.text}
          id="todoText"
          name="todo"
          className="w-full h-full py-2 px-1 border-2 border-[#282C34] focus-within:outline-none focus-within:border-purple-500 rounded-sm text-black mb-4"
          required
          autoFocus
          autoComplete="off"
        />
        <input
          type="hidden"
          name="todoID"
          value={todo.id}
        />
        <section
          className="flex"
        >
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded-sm"
          >
            Save changes
          </button>
          <button
            className="text-[#282C34] hover:text-black focus:text-black py-2 pl-4 ml-auto rounded-sm"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </button>
        </section>
      </form>
    </dialog>
  )
}

type TTodoProps = {
  todo: TTodo;
  handleTodoTextChange: (form: HTMLFormElement, ref: RefObject<HTMLDialogElement>) => void;
  handleTodoStatusChange: ChangeEventHandler<HTMLInputElement>;
  handleTodoDelete: MouseEventHandler<HTMLButtonElement>;
}

function Todo(props: TTodoProps) {

  const { todo, handleTodoTextChange, handleTodoStatusChange, handleTodoDelete } = props;
  const editModal = useRef<HTMLDialogElement>(null);

  return (
    <li
      className="flex gap-2 items-center"
    >
      <input
        className="w-6 h-6 accent-purple-500"
        type="checkbox"
        checked={todo.done}
        id={todo.id}
        onChange={handleTodoStatusChange}
      />
      <section>
        <p className="font-bold font-mono text-lg">
          {todo.text}
        </p>
        <small>
          {todo.creationDate}
        </small>
      </section>
      <section
        className="flex gap-2 ml-auto"
      >
        <button
          className="bg-green-200 h-fit py-1 px-2 rounded-sm hover:bg-green-100"
          title="Edit todo"
          value={todo.id}
          onClick={() => editModal.current?.showModal()}
        >
          ✍️
        </button>
        <button
          className="bg-red-200 h-fit py-1 px-2 rounded-sm hover:bg-red-100"
          title="Remove todo"
          value={todo.id}
          onClick={handleTodoDelete}
        >
          ❌
        </button>
      </section>
      <TodoEditDialog todo={todo} dialogRef={editModal} handleTodoTextChange={handleTodoTextChange} />
    </li>
  )
}

type TTodoFilter = "all" | "done" | "not done";

type TSegmentedButton = {
  values: string[];
  filterValue: TTodoFilter;
  handleFilterChange: MouseEventHandler<HTMLButtonElement>;
}

function SegmentedButton(props: TSegmentedButton) {

  const { values, filterValue, handleFilterChange } = props;

  return (
    <ul
      className="grid grid-cols-3 gap-1 mx-auto mb-4 p-1 w-fit border border-t-gray-300 rounded-lg"
    >
      {
        values.map(value => (
          <li
            key={value}
          >
            <button
              className={filterValue === value ? "w-full bg-white text-black rounded p-1 text-center" : "w-full text-center rounded p-1 hover:bg-gray-600"}
              value={value}
              onClick={handleFilterChange}
            >
              {value}
            </button>
          </li>
        ))
      }
    </ul>
  )
}

type TTodoList = {
  todos: TTodo[];
  handleTodoTextChange: (form: HTMLFormElement, ref: RefObject<HTMLDialogElement>) => void;
  handleTodoStatusChange: ChangeEventHandler<HTMLInputElement>;
  handleTodoDelete: MouseEventHandler<HTMLButtonElement>;
}

function TodoList(props: TTodoList) {
  const searchParamsObj = new URLSearchParams(location.search);
  /*   A mecanism to force React to rerender to derive the filter value from the URL. 
   *   This has to be done since React does not listen to changes from the URLSearchParam object.*/
  const [_, setLastRerender] = useState<number>(Date.now());

  let filter: TTodoFilter = searchParamsObj.get("filter") as TTodoFilter ?? "all";

  useEffect(() => {
    const searchParamIsPresent = searchParamsObj.has("filter");

    if (!searchParamIsPresent) {
      searchParamsObj.set("filter", "all");
      window.history.replaceState({}, "", `${location.pathname}?${searchParamsObj}`);
    }
  }, [])

  function handleFilterChange(e: MouseEvent<HTMLButtonElement>) {
    const newFilterValue = e.currentTarget.value as TTodoFilter;
    searchParamsObj.set("filter", newFilterValue);
    window.history.replaceState({}, "", `${location.pathname}?${searchParamsObj}`);

    setLastRerender(Date.now());
  }

  function filterTodos(list: TTodo[], filter: TTodoFilter): TTodo[] {
    if (filter === "done") {
      return list.filter(element => element.done === true);
    } else if (filter === "not done") {
      return list.filter(element => element.done === false);
    }

    return list;
  }

  const listToRender = filterTodos(props.todos, filter);
  const thereAreTodos = listToRender.length > 0;

  return (
    <>
      <SegmentedButton
        values={["all", "done", "not done"]}
        filterValue={filter}
        handleFilterChange={handleFilterChange}
      />
      {
        thereAreTodos
          ? <ul
            className="grid gap-1 max-h-[32rem] overflow-y-auto">
            {
              listToRender.map((todo, idx) => (
                <Todo
                  key={`${todo.creationDate}${idx}`}
                  todo={todo}
                  handleTodoTextChange={props.handleTodoTextChange}
                  handleTodoStatusChange={props.handleTodoStatusChange}
                  handleTodoDelete={props.handleTodoDelete}
                />
              ))
            }
          </ul>
          : <p
            className="text-center text-white"
          >
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

  function handleTodoTextChange(e: HTMLFormElement, ref: RefObject<HTMLDialogElement>) {
    const formData = new FormData(e);

    const todoID = formData.get("todoID") as string;
    const newTodoText = formData.get("todo") as string;

    const newListOfTodos = listOfTodos.map(todo => {
      if (todo.id === todoID) {
        const changedTodo: TTodo = { ...todo, text: newTodoText };

        return changedTodo;
      }

      return todo;
    });

    setList(newListOfTodos);

    ref.current?.close();
  }

  function handleTodoStatusChange(e: ChangeEvent<HTMLInputElement>) {
    const todoID = e.currentTarget.id;

    const newStatus = e.currentTarget.checked;

    const newListOfTodos = listOfTodos.map(todo => {
      if (todo.id === todoID) {
        const changedTodo: TTodo = { ...todo, done: newStatus };

        return changedTodo;
      }

      return todo;
    });

    setList(newListOfTodos);
  }

  function handleTodoDelete(e: MouseEvent<HTMLButtonElement>) {
    const todoID = e.currentTarget.value;

    const newListOfTodos = listOfTodos.filter(todo => todo.id !== todoID);

    setList(newListOfTodos);
  }

  return (
    <main
      className="w-[40vw] mx-auto p-8"
    >
      <h1
        className="text-white text-2xl font-bold text-center mb-8"
      >
        Todo app with URLSearchParams
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
            className="w-full h-full py-2 px-1 rounded-sm outline-none border-2 border-transparent focus-within:border-purple-500 text-black"
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
      <TodoList
        todos={listOfTodos}
        handleTodoTextChange={handleTodoTextChange}
        handleTodoStatusChange={handleTodoStatusChange}
        handleTodoDelete={handleTodoDelete}
      />
    </main>
  )
}

export default App
