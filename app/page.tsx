"use client";

import { useReducer, useRef, useState } from "react";
import TaskWindow, { createTask, Task } from "./TaskWindow";

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const editCallback = useRef<CallableFunction>();

  const openTaskWindow = (callback: CallableFunction) => {
    editCallback.current = callback;
  };

  return (
    <div
      className="w-screen h-screen"
      onMouseMove={(e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }}
    >
      <TaskWindow
        mousePosition={mousePosition}
        containerId={0}
        startingName={"Color Tests"}
        openTaskWindow={openTaskWindow}
        defTasks={[
          createTask("I'm Yellow", "yellow"),
          createTask("I'm Blue", "blue"),
          createTask("I'm Red", "red"),
        ]}
      />
      <div className="absolute bottom-0 h-10 w-full bg-zinc-800">Ass</div>
    </div>
  );
};

export default Home;
