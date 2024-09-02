# Task Management Application

This project is a task management application built using React + TypeScript + Tailwind. It allows users to create, edit, and manage tasks within multiple windows. The application features a dynamic taskbar, draggable task windows, and persistent state management using local storage.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) 
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Cool](/screenshots/windows.png)

###### Check It by yourself:
https://windowed-todo-app.vercel.app/

# How to run?

```
npm install
npm run dev
```

## File Structure

- **TaskBar.tsx**: Component responsible for rendering the taskbar and managing window visibility.
- **TaskWindow.tsx**: Component representing individual task windows.
- **Page.tsx**: Main component that integrates all other components and manages the overall state of the application.

## Components

### TaskBar

The TaskBar component is responsible for displaying the taskbar at the bottom of the screen. It allows users to toggle the visibility of task windows and create new windows.

#### Props

- `windows`: Array of `TaskList` objects representing the current windows.
- `changeVisibility`: Function to change the visibility of a window.
- `newWindow`: Function to create a new window.

### App

The App component is the main component of the application. It manages the state of the tasks, windows, handles mouse events, and renders the TaskBar and TaskWindow components.

#### State

- `mousePosition`: Current mouse position.
- `windowRefs`: Array of references to the window elements, it length setermines the max number of active windows not counting the EditWindow
- `lengths`: Array of lengths of the task lists, used to bulletproof editing window.
- `windows`: Array of `TaskList` objects representing the current windows. **Upon change it automaticly sets first window visiblity to false if number of visible windows exceeds the length of windowRefs**
- `editingTasks`: Array of tasks currently being edited.
- `editingIndex`: Index of the task currently being edited.
- `windowID`: ID of window of the currently edited task.

#### Functions

- `updateLength(value: number, window: number)`: Updates the length of the task list for a specific window.
- `cancelSelection()`: Cancels the current selection (used by `EditWindow`).
- `openTaskWindow(tasks: Task[], index: number, windowID: number)`: Opens a task in **EditWindow**
- `createTask(name: string, color = ""): Task`: Creates a new task with the specified name and color.

### TaskWindow

The TaskWindow component represents an individual task window. It displays tasks and allows users to edit or delete them.
It's index in **windowRefs** is termined by `relativeIndex`: windowsId and visibility formated into continous indexes

#### Props

- `ref`: Reference to the window element.
- `mousePosition`: Current mouse position.
- `containerId`: ID of the window container.
- `windowName`: Object containing getter and setter for the window name.
- `openTaskWindow`: Function to open a task window.
- `defTasks`: Default tasks for the window.
- `activeIndex`: Index of the currently active task.
- `updateLength`: Function to update the length of the task list.
- `cancelSelection`: Function to cancel the current selection.
- `minimalise`: Function to minimize the window.
- `remove`: Function to mark a window as removed, TaskWindow is relly removed only after full page reload

### EditWindow

The EditWindow component is responsible for rendering the task editing interface. It allows users to edit the name and color of a task and delete it.

#### Props

- `myRef`: Reference to the window element.
- `task`: Task object being edited.
- `index`: Index of the task being edited.
- `mousePosition`: Current mouse position.
- `windowId`: ID of the window containing the task.
