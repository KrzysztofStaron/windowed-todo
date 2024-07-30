"use client";

import React, { useEffect, useState } from "react";
import { TaskList } from "./page";
import { HiOutlinePlus } from "react-icons/hi";

type TaskBarApp = {
  name: string;
  id: number;
};

const TaskBarApp = ({
  app,
  changeVisibility,
  visible,
}: {
  app: TaskBarApp;
  changeVisibility: (visible: boolean, id: number) => void;
  visible: boolean;
}) => {
  return (
    <button
      className={`${
        visible
          ? " bg-zinc-800 text-gray-100 taskBarApp"
          : "taskBarAppClosed text-gray-400"
      } h-9 flex items-center justify-center hover:text-white px-4 min-w-28 font-bold rounded-lg`}
      onClick={(e) => changeVisibility(!visible, app.id)}
    >
      {app.name}
    </button>
  );
};

const TaskBar = ({
  windows,
  changeVisibility,
  newWindow,
}: {
  windows: TaskList[];
  changeVisibility: (visible: boolean, id: number) => void;
  newWindow: () => void;
}) => {
  return (
    <div className="absolute bottom-0 h-12 w-full bg-zinc-950 flex gap-2 border-t-2 border-zinc-600 p-1">
      {windows.map((window, index) => (
        <TaskBarApp
          key={index}
          app={{ name: window.name, id: window.id } as TaskBarApp}
          changeVisibility={changeVisibility}
          visible={window.visible}
        />
      ))}
      <button
        className={`
         bg-zinc-800 text-gray-100 taskBarApp h-9 flex items-center justify-center hover:text-white w-9 font-bold rounded-lg `}
        onClick={(e) => newWindow()}
      >
        <HiOutlinePlus />
      </button>
    </div>
  );
};

export default TaskBar;
