"use client";

import { open } from "fs/promises";
import React, {
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react";
import { IoIosCheckmark, IoMdAddCircleOutline } from "react-icons/io";

const BOTTOM_MARGIN = 55;

export type Task = {
  name: string;
  done: boolean;
  color: string;
};

export enum TaskActions {
  ADD,
  REMOVE,
  STATUS,
  UPDATE,
}

const tasksReducer = (
  state: Task[],
  action: {
    type: TaskActions;
    payload: any;
    index?: number;
  }
) => {
  switch (action.type) {
    case TaskActions.ADD:
      return [...state, action.payload];
    case TaskActions.REMOVE:
      return state.filter((_, index) => index !== action.index);
    case TaskActions.STATUS:
      return state.map((task, index) => {
        if (index === action.payload) {
          return { ...task, done: !task.done };
        }
        return task;
      });
    case TaskActions.UPDATE:
      return state.map((task, index) => {
        if (index === action.index) {
          return action.payload;
        }
        return task;
      });
    default:
      return state;
  }
};

export const TaskComponent = ({
  task,
  index,
  dispatch,
  isDragging,
  openTaskWindow,
  windowId,
  tasks,
  active,
  cancelSelection,
}: {
  task: Task;
  index: number;
  dispatch: CallableFunction;
  isDragging: boolean;
  openTaskWindow: CallableFunction;
  windowId: number;
  tasks: Task[];
  active: boolean;
  cancelSelection: CallableFunction;
}) => {
  return (
    <div
      className={`flex task items-center cursor-pointer ${
        active ? "bg-zinc-600" : "bg-zinc-800"
      } transition-all rounded-lg border-2 gap-2 p-1 justify-between ${
        task.done || isDragging || `${task.color}`
      } ${task.done ? "order-2 opacity-80" : "order-1"}`}
      onDoubleClick={(e) => {
        if (!task.done) {
          dispatch({ type: TaskActions.STATUS, payload: index });
        }
        cancelSelection();
      }}
      onClick={(e) => {
        if (active) {
          cancelSelection();
        } else if (
          (e.target as HTMLElement)?.tagName !== "BUTTON" &&
          (e.target as HTMLElement)?.tagName !== "svg"
        ) {
          openTaskWindow(tasks, index, windowId);
        }
      }}
    >
      <p
        className={`w-80 text-center transition-all font-bold mx-1 ${
          task.done ? "text-zinc-500" : "text-white"
        }`}
        style={{ userSelect: "none" }}
      >
        {task.name}
      </p>

      <button
        onClick={() => {
          dispatch({ type: TaskActions.STATUS, payload: index });
        }}
        className={`flex items-center justify-center transition-all text-black h-5 w-5  ${
          task.done
            ? `${task.color} rounded-md`
            : `bg-white rounded-sm ${task.color}_h`
        }`}
      >
        <h1 className="text-2xl" id="check">
          {task.done ? <IoIosCheckmark /> : null}
        </h1>
      </button>
    </div>
  );
};

export const WindowTitle = ({ editing, setEditing, windowName }: any) => {
  return (
    <>
      <button
        className="grow text-left"
        onContextMenu={(e) => {
          e.preventDefault();
          setEditing(true);
        }}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            setEditing(false);
          }
        }}
      >
        {editing ? (
          <>
            <input
              type="text"
              className="font-bold w-full bg-transparent h-6 outline-none truncate overflow-hidden"
              value={windowName.get}
              onChange={(e) => windowName.set(e.target.value.replace(/:$/, ""))}
              onBlur={() => setEditing(false)}
              autoFocus
            />
          </>
        ) : (
          <p className="font-bold" style={{ userSelect: "none" }}>
            {windowName.get + ":"}
          </p>
        )}
      </button>
    </>
  );
};

const createTask = (name: string, color = ""): Task => {
  return { name: name, done: false, color: color };
};

const TaskWindow = React.forwardRef(
  (
    {
      windowId,
      mousePosition,
      windowName,
      openTaskWindow,
      activeIndex,
      cancelSelection,
      minimalise,
      remove,
    }: {
      windowId: number;
      mousePosition: { x: number; y: number };
      windowName: { get: string; set: (v: string) => void };
      openTaskWindow: (tasks: Task[], index: number, windowID: number) => void;
      activeIndex?: number;
      cancelSelection: CallableFunction;
      minimalise: CallableFunction;
      remove: CallableFunction;
    },
    ref: any
  ) => {
    const windowRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      handleDispatch(args: any) {
        handleDispatch(args);
      },
      handleMinimalise() {
        handleMinimalise();
      },
    }));

    const handleMinimalise = () => {
      windowRef.current?.classList.add("minimalize");
      windowRef.current?.classList.remove("showWindow");
      setTimeout(() => {
        minimalise();
      }, 200);
    };

    const handleDispatch = function (args: any) {
      tasksDispatch(args);
      if (args.type === TaskActions.REMOVE) {
        console.log(tasks);
        openTaskWindow(
          tasks.filter((_, index) => index !== args.index),
          args.index,
          windowId
        );
      }
    };

    const [tasks, tasksDispatch] = useReducer(
      tasksReducer,
      JSON.parse(localStorage.getItem("tasks" + windowId)!) ?? []
    );

    useEffect(() => {
      localStorage.setItem("tasks" + windowId, JSON.stringify(tasks));
    }, [tasks]);

    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [position, setPosition] = useState(() => {
      if (localStorage.getItem("taskWindowPosition" + windowId)) {
        return JSON.parse(
          localStorage.getItem("taskWindowPosition" + windowId)!
        );
      } else {
        return { x: 0, y: 0 };
      }
    });

    const [editing, setEditing] = useState(false);

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, []);

    useEffect(() => {
      localStorage.setItem(
        "taskWindowPosition" + windowId,
        JSON.stringify(position)
      );
    }, [position]);

    useEffect(() => {
      if (!isDragging) return;
      const maxY =
        window.innerHeight - BOTTOM_MARGIN - windowRef!.current!.clientHeight;

      setPosition({
        x: mousePosition.x + offset.x,
        y: Math.min(mousePosition.y + offset.y, maxY),
      });
      /*
      if (mousePosition.y + offset.y > maxY) {
        if (mousePosition.y + offset.y - maxY > 30) {
          setIsDragging(false);
        }
      }*/
    }, [mousePosition]);

    const addTask = (task: Task) => {
      tasksDispatch({ type: TaskActions.ADD, payload: task });
    };

    return (
      <div
        ref={windowRef}
        className="window flex flex-col fixed showWindow"
        style={{
          left: position.x,
          top: Math.min(window.innerHeight - BOTTOM_MARGIN, position.y),
          width: 400,
        }}
      >
        {/* Header */}
        <div
          className="text-white bg-zinc-800 h-6 flex items-center justify-between px-2 rounded-t-md cursor-grab w-full gap-4 "
          onMouseDown={(e) => {
            if (!editing) {
              setOffset({
                x: position.x - e.clientX,
                y: position.y - e.clientY,
              });
              setIsDragging(true);
            }
          }}
          onMouseUp={(e) => {
            setIsDragging(false);
          }}
        >
          <WindowTitle
            editing={editing}
            setEditing={setEditing}
            windowName={windowName}
          />

          <div className="flex gap-1.5">
            <button
              className="rounded-full bg-yellow-400 h-3.5 w-3.5"
              onClick={() => handleMinimalise()}
            ></button>
            <button
              className="rounded-full bg-red-500 h-3.5 w-3.5"
              onClick={() => remove()}
            ></button>
          </div>
        </div>

        {/* Body + Border */}
        <div className="flex flex-col border-zinc-800 border-x-4 border-b-4 rounded-b-md h-full pb-2.5 items-center">
          {/* Map Tasks */}
          <div className="flex flex-col tasksContainer overflow-scroll gap-3 px-2.5 mb-2.5 mt-2.5 overflow-x-hidden">
            {tasks.map((task, index) => (
              <TaskComponent
                cancelSelection={cancelSelection}
                windowId={windowId}
                openTaskWindow={openTaskWindow}
                key={index}
                task={task}
                tasks={tasks}
                isDragging={isDragging}
                index={index}
                dispatch={(args: any) => tasksDispatch(args)}
                active={activeIndex === index ?? false}
              />
            ))}
          </div>

          <div
            className="h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white text-2xl hover:bg-zinc-700 cursor-pointer order-4 newTaskButton"
            onClick={(e) => {
              addTask(createTask("New Task", "white"));
              openTaskWindow(
                [...tasks, createTask("New Task", "white")],
                tasks.length,
                windowId
              );
            }}
          >
            <IoMdAddCircleOutline />
          </div>
        </div>
      </div>
    );
  }
);
export default TaskWindow;
