"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa";
import {
  IoIosCheckmark,
  IoMdAddCircleOutline,
  IoMdCheckmark,
} from "react-icons/io";

const BOTTOM_MARGIN = 230;

export type Task = {
  name: string;
  done: boolean;
  color: string;
};

enum TaskActions {
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
      return state.filter((_, index) => index !== action.payload);
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

const TaskComponent = ({
  task,
  index,
  dispatch,
  isDragging,
}: {
  task: Task;
  index: number;
  dispatch: CallableFunction;
  isDragging: boolean;
}) => {
  const [activated, setActivated] = React.useState(false);

  return (
    <div
      className={`flex task items-center cursor-pointer bg-zinc-800 transition-all rounded-lg border-2 gap-2 p-1 justify-between ${
        task.done || isDragging || `${task.color}`
      }`}
      onDoubleClick={(e) => {
        if (!task.done) {
          setActivated(!activated);
          dispatch({ type: TaskActions.STATUS, payload: index });
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
          setActivated(!activated);
          dispatch({ type: TaskActions.STATUS, payload: index });
        }}
        className={`flex items-center justify-center transition-all text-black h-5 w-5  ${
          activated
            ? `${task.color} rounded-md`
            : `bg-white rounded-sm ${task.color}_h`
        }`}
      >
        <h1 className="text-2xl">{activated ? <IoIosCheckmark /> : null}</h1>
      </button>
    </div>
  );
};

const WindowTitle = ({
  editing,
  setEditing,
  windowName,
  setWindowName,
}: any) => {
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
              value={windowName}
              onChange={(e) => setWindowName(e.target.value)}
              onBlur={() => setEditing(false)}
              autoFocus
            />
          </>
        ) : (
          <p className="font-bold" style={{ userSelect: "none" }}>
            {windowName + ":"}
          </p>
        )}
      </button>
    </>
  );
};

export const createTask = (name: string, color = ""): Task => {
  return { name: name, done: false, color: color };
};

const TaskWindow = ({
  containerId,
  mousePosition,
  defTasks,
  startingName,
  openTaskWindow,
}: {
  containerId: number;
  mousePosition: { x: number; y: number };
  defTasks: Task[];
  startingName: string;
  openTaskWindow: (callback: CallableFunction) => void;
}) => {
  const [windowName, setWindowName] = useState(startingName);

  const [tasks, tasksDispatch] = useReducer(tasksReducer, defTasks);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(
    JSON.parse(
      localStorage.getItem("taskWindowPosition" + containerId) || ""
    ) || {
      x: 0,
      y: 0,
    }
  );
  const [editing, setEditing] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "taskWindowPosition" + containerId,
      JSON.stringify(position)
    );
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    setPosition({
      x: mousePosition.x + offset.x,
      y: Math.min(
        mousePosition.y + offset.y,
        window.innerHeight - BOTTOM_MARGIN
      ),
    });
  }, [mousePosition]);

  const addTask = (task: Task) => {
    tasksDispatch({ type: TaskActions.ADD, payload: task });
  };

  const removeTask = (id: number) => {
    tasksDispatch({ type: TaskActions.REMOVE, payload: id });
  };

  return (
    <div
      className="window flex flex-col fixed"
      style={{
        left: position.x,
        top: Math.min(window.innerHeight - BOTTOM_MARGIN, position.y),
      }}
    >
      {/* Header */}
      <div
        className="text-white bg-zinc-800 h-6 flex items-center justify-between px-2 rounded-t-md cursor-grab w-full gap-4"
        onMouseDown={(e) => {
          if (!editing) {
            setOffset({ x: position.x - e.clientX, y: position.y - e.clientY });
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
          setWindowName={setWindowName}
        />

        <div className="flex gap-1.5">
          <button className="rounded-full bg-yellow-400 h-3.5 w-3.5"></button>
          <button className="rounded-full bg-red-700 h-3.5 w-3.5"></button>
        </div>
      </div>

      {/* Body + Border */}
      <div className="flex flex-col gap-3 border-zinc-800 border-x-4 border-b-4 p-2 pt-3 rounded-b-md h-full">
        {tasks.map((task, index) => (
          <TaskComponent
            key={index}
            task={task}
            isDragging={isDragging}
            index={index}
            dispatch={(args: any) => tasksDispatch(args)}
          />
        ))}
        <div
          className="w-full h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-2xl hover:bg-zinc-800 cursor-pointer"
          onClick={(e) => openTaskWindow((args: any) => tasksDispatch(args))}
        >
          <IoMdAddCircleOutline />
        </div>
      </div>
    </div>
  );
};

/*
const Child = React.forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    childMethod() {
      ooo();
    },
  }));

  function ooo() {
    console.log("call me");
  }

  return <></>;
});
*/
export default TaskWindow;
