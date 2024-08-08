"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TaskWindow, { Task, TaskActions, WindowTitle } from "./TaskWindow";
import { FaRegTrashAlt } from "react-icons/fa";
import TaskBar from "./TaskBar";

export type TaskList = {
  name: string;
  id: number;
  visible: boolean;
  deleted: boolean;
};

const App = () => {
  const [windows, setWindows] = useState<TaskList[]>([]);

  const [loading, setLoading] = useState(true);

  const windowRefs: React.MutableRefObject<any>[] = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [editingTasks, setEditingTasks] = useState<Task[]>([
    createTask("", "-1"),
  ]);
  const [editingIndex, setEditingIndex] = useState<number>(0);
  const [windowID, setWindowId] = useState<number>(-1);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteWindowId, setDeleteWindowId] = useState<number>(-1);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem("windows", JSON.stringify(windows));
  }, [windows]);

  useEffect(() => {
    let win = JSON.parse(localStorage.getItem("windows") ?? "[]") as TaskList[];
    setWindows(win);
    setLoading(false);
  }, []);

  const cancelSelection = () => {
    setEditingIndex(-1);
  };

  const openTaskWindow = (tasks: Task[], index: number, windowID: number) => {
    setEditingIndex(index);
    setEditingTasks(tasks);
    setWindowId(windowID);

    console.log(
      `index: ${index}, windowID: ${windowID}, tasks: ${tasks.map(
        (t) => t.name
      )}`
    );
  };

  useEffect(() => {
    if (loading) return;

    let found = false;
    for (let w of windows) {
      if (w.deleted === false) {
        found = true;
        break;
      }
    }

    if (found === false) {
      localStorage.clear();
    }
  }, [windows]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      let isClickedOutside = false;

      if ((e.target as HTMLElement)?.id === "cancel-selection") {
        isClickedOutside = true;
      }

      if (isClickedOutside) {
        setEditingIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && showConfirmation === true) {
        handleConfirm();
      }
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const relativeIndex = useMemo(() => {
    let ret = new Map<number, number>();

    for (let i = 0; i < windows.length; i++) {
      if (windows[i].visible) {
        ret.set(i, ret.size);
      }
    }

    return ret;
  }, [windows]);

  useEffect(() => {
    const indexToRemove = windows.findIndex((el) => el.visible);
    if (
      indexToRemove === -1 ||
      windows.reduce((total, x) => (x.visible ? total + 1 : total), 0) <=
        windowRefs.length
    )
      return;

    console.log(
      windows.reduce((total, x) => (x.visible ? total + 1 : total), 0)
    );

    setWindows((prev) =>
      prev.map((el, i) => {
        if (i == indexToRemove) {
          return { ...el, visible: false };
        }
        return el;
      })
    );
  }, [windows]);

  const handleConfirm = () => {
    setWindows((prev) => {
      return prev.map((w, i) =>
        i == deleteWindowId
          ? { ...prev[i], name: "", tasks: [], deleted: true }
          : w
      );
    });
    localStorage.removeItem(`tasks${deleteWindowId}`);
    localStorage.removeItem(`taskWindowPosition${deleteWindowId}`);

    setShowConfirmation(false);
  };

  return (
    <>
      {showConfirmation ? (
        <div className="w-screen h-screen flex items-center justify-center absolute z-50 bg-opacity-60 bg-black">
          <div className="bg-zinc-800 text-white p-4 rounded-md">
            <h1 className="text-lg mb-4 font-semibold">
              Are you sure you want to delete this task?
            </h1>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-1 rounded-md"
                autoFocus
                onClick={() => {
                  handleConfirm();
                }}
              >
                Yes
              </button>
              <button
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-1 rounded-md"
                onClick={() => setShowConfirmation(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div
        className="w-screen h-screen"
        id="cancel-selection"
        onMouseMove={(e) => {
          setMousePosition({ x: e.clientX, y: e.clientY });
        }}
      >
        <div>
          <EditWindow
            windowRef={windowRefs[relativeIndex.get(windowID)!]}
            index={editingIndex}
            task={editingTasks[editingIndex]}
            mousePosition={mousePosition}
          />
          {windows.map((window, index) => {
            if (!window.visible || window.deleted) return null;
            return (
              <TaskWindow
                ref={windowRefs[relativeIndex.get(index)!]}
                key={window.id}
                mousePosition={mousePosition}
                windowId={index}
                windowName={{
                  get: window.name,
                  set: (name: string) => {
                    setWindows((prev) =>
                      prev.map((val, i) =>
                        i === index ? { ...val, name: name } : val
                      )
                    );
                  },
                }}
                openTaskWindow={openTaskWindow}
                activeIndex={windowID === index ? editingIndex : -1}
                cancelSelection={cancelSelection}
                minimalise={() => {
                  setWindows((prev) =>
                    prev.map((val, i) =>
                      i === index ? { ...val, visible: false } : val
                    )
                  );
                }}
                remove={() => {
                  setShowConfirmation(true);
                  setDeleteWindowId(index);
                }}
              />
            );
          })}

          <TaskBar
            windows={windows}
            changeVisibility={(visible, id) => {
              setWindows((prev) =>
                prev.map((val, i) => {
                  if (
                    relativeIndex.size === windowRefs.length &&
                    i === Array.from(relativeIndex.keys())[0]
                  ) {
                    console.log("reduce");
                    return { ...val, visible: false };
                  }

                  return i === id ? { ...val, visible: visible } : val;
                })
              );
            }}
            newWindow={() => {
              setWindows((prev) => [
                ...prev,
                {
                  tasks: [],
                  name: "New window",
                  id: (prev[prev.length - 1]?.id ?? -1) + 1,
                  visible: true,
                  deleted: false,
                },
              ]);
            }}
          />
        </div>
      </div>
    </>
  );
};
// used for Hardcoding
const createTask = (name: string, color = ""): Task => {
  return { name: name, done: false, color: color };
};

const EditWindow = ({
  windowRef,
  task,
  index,
  mousePosition,
}: {
  windowRef: any;
  task: Task;
  index: number;
  mousePosition: any;
}) => {
  const [name, setName] = useState(task?.name ?? "");
  const [color, setColor] = useState(task?.color ?? "-1");

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [position, setPosition] = useState(() => {
    if (localStorage.getItem("editPos")) {
      return JSON.parse(localStorage.getItem("editPos")!);
    } else {
      return { x: 0, y: 0 };
    }
  });

  useEffect(() => {
    localStorage.setItem("editPos", JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    setPosition({
      x: mousePosition.x + offset.x,
      y: mousePosition.y + offset.y,
    });
  }, [mousePosition]);

  useEffect(() => {
    if (!task) return;
    setColor(task.color);
  }, [task?.color, index]);

  useEffect(() => {
    if (!task) return;
    setName(task.name);
  }, [task?.name, index]);

  useEffect(() => {
    if (color == "-1") {
      return;
    }
    windowRef.current.handleDispatch({
      type: TaskActions.UPDATE,
      index: index,
      payload: { name: name, done: false, color: color },
    });
  }, [name, color]);

  return (
    <div
      className="flex flex-col fixed"
      style={{ height: 350, width: 350, left: position.x, top: position.y }}
    >
      {/* Header */}
      <div
        className="text-white bg-zinc-800 h-6 flex items-center justify-between px-2 rounded-t-md cursor-grab w-full gap-4"
        onMouseDown={(e) => {
          setOffset({
            x: position.x - e.clientX,
            y: position.y - e.clientY,
          });
          setIsDragging(true);
        }}
        onMouseUp={(e) => {
          setIsDragging(false);
        }}
      >
        <WindowTitle
          editing={false}
          setEditing={() => {}}
          windowName={{ get: "Manage Task", set: (v: string) => {} }}
          setWindowName={() => {}}
        />
      </div>

      {/* Body + Border */}
      <div
        className="flex flex-col border-zinc-800 border-x-4 border-b-4 p-2 pt-3 rounded-b-md justify-between"
        style={{ height: 400 }}
      >
        {task && task.color != "-1" ? (
          <>
            <div className="w-full flex flex-col items-center">
              <label className="text-white">Name: </label>
              <input
                type="text"
                className="text-black w-11/12 text-center font-bold focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full items-center justify-center">
              <button
                className={`bg-white w-8 h-8 border-4 rounded-md ${
                  color === "white"
                    ? "border-white cursor-default"
                    : "border-black hover:bg-gray-300"
                }`}
                onClick={() => setColor("white")}
              ></button>
              <button
                className={`bg-yellow-400 w-8 h-8 border-4 rounded-md ${
                  color === "yellow"
                    ? "border-white cursor-default"
                    : "border-black hover:bg-yellow-200"
                }`}
                onClick={() => setColor("yellow")}
              ></button>
              <button
                className={`bg-cyan-400 w-8 h-8 border-4 rounded-md ${
                  color === "blue"
                    ? "border-white cursor-default"
                    : "border-black hover:bg-cyan-200"
                }`}
                onClick={() => setColor("blue")}
              ></button>
              <button
                className={`bg-red-500 w-8 h-8 border-4 sounded-md ${
                  color === "red"
                    ? "border-white cursor-default"
                    : "border-black hover:bg-red-400"
                }`}
                onClick={() => setColor("red")}
              ></button>
            </div>

            <button
              className="px-5 bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 text-xl h-10 rounded-lg"
              onClick={() => {
                windowRef.current.handleDispatch({
                  type: TaskActions.REMOVE,
                  index: index,
                });
              }}
            >
              <FaRegTrashAlt />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-white">No Task</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
