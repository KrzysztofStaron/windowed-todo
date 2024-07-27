"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoIosCheckmark, IoMdCheckmark } from "react-icons/io";

type Task = {
  name: string;
  done: boolean;
  color: string;
};

enum TaskActions {
  ADD,
  REMOVE,
  STATUS,
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
    default:
      return state;
  }
};

const Home = () => {
  const createTask = (name: string, color = ""): Task => {
    return { name: name, done: false, color: color };
  };

  const [tasks, tasksDispatch] = useReducer(tasksReducer, [
    createTask("Handle double click ahoy przygodo asssss", "yellow"),
    createTask("I'm Blue", "blue"),
    createTask("I'm Red", "red"),
  ]);

  const addTask = (name: string) => {
    tasksDispatch({ type: TaskActions.ADD, payload: createTask(name) });
  };

  const removeTask = (id: number) => {
    tasksDispatch({ type: TaskActions.REMOVE, payload: id });
  };

  return (
    <div className="w-screen h-screen ">
      <TaskContainer
        containerId={0}
        tasks={tasks}
        tasksDispatch={tasksDispatch}
      />
    </div>
  );
};

const TaskComponent = ({
  task,
  index,
  dispatch,
}: {
  task: Task;
  index: number;
  dispatch: CallableFunction;
}) => {
  const [activated, setActivated] = React.useState(false);

  useEffect(() => {
    dispatch({ type: TaskActions.STATUS, payload: index });
  }, [activated]);

  return (
    <div
      className={`flex task items-center cursor-pointer bg-zinc-800 transition-all rounded-lg border-2 gap-2 p-1 justify-between ${
        task.done || `${task.color}`
      }`}
      onDoubleClick={(e) => {
        if (!task.done) {
          setActivated(!activated);
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
        onClick={() => setActivated(!activated)}
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

const TaskContainer = ({
  containerId,
  tasks,
  tasksDispatch,
}: {
  containerId: number;
  tasks: Task[];
  tasksDispatch: CallableFunction;
}) => {
  return (
    <div className="window flex flex-col">
      <div className="text-white bg-zinc-800 h-6 flex items-center justify-between px-2 rounded-t-md cursor-grab">
        <b>Title:</b>
        <div className="flex gap-1">
          <button className="rounded-full bg-yellow-400 h-4 w-4"></button>
          <button className="rounded-full bg-red-700 h-4 w-4"></button>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-zinc-800 border-x-4 border-b-4 p-2 pt-3 rounded-b-md h-full">
        {tasks.map((task, index) => (
          <TaskComponent
            key={index}
            task={task}
            index={index}
            dispatch={(args: any) => tasksDispatch(args)}
          />
        ))}
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
export default Home;
