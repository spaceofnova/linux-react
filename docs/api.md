# API

This is the API documentation for the Linux-React project.

## Table of Contents

- [Getting Started](#getting-started)
- [Dispatcher API](#dispatcher-api)
- [Window API](#window-api)

## Getting started

To use the API, you need to install the `linux-react-api` package using your preferred package manager.

```bash
npm install linux-react-api
bun add linux-react-api
yarn add linux-react-api
pnpm add linux-react-api
```

### Basic Setup Example

```javascript

```

## Dispatcher API

The `Dispatcher` Allows you to interact with inner functions of the OS from your application.

Basic usage:

```javascript
import { dispatch } from "linux-react-api";

dispatch(methodName, {
  // Parameters for the method
});
```

### Methods

#### `MOVE_WINDOW`

Moves a window to a new position.

##### Parameters

- `id`: The ID of the window to move.
- `position`: The new position of the window.
- `relative`: Whether to move the window relative to its current position.

#### `RESIZE_WINDOW`

Resizes a window to a new size.

##### Parameters

- `id`: The ID of the window to resize.
- `size`: The new size of the window.
- `position`: The new position of the window.

#### `FOCUS_WINDOW`

Focuses a window.

##### Parameters

- `id`: The ID of the window to focus.

#### `CLOSE_WINDOW`

Closes a window.

##### Parameters

- `id`: The ID of the window to close.

#### `MAXIMIZE_WINDOW`

Maximizes a window.

##### Parameters

- `id`: The ID of the window to maximize.

#### `MINIMIZE_WINDOW`

Minimizes a window.

##### Parameters

- `id`: The ID of the window to minimize.

#### `RESTORE_WINDOW`

Restores a minimized window.

##### Parameters

- `id`: The ID of the window to restore.

## Window API

### Creating a Window

To create a window, you can use the `createWindow` method provided by api.

```javascript
import { createWindow, dispatch, generateID } from "linux-react-api";

(() => {
  // Generate a unique ID for the window
  const windowID = generateID();

  // Define the HTML content for the window
  const windowContent = `
    <div id="files">Hello World!</div>
  `;

  // Create the window with the specified properties
  createWindow({
    id: windowID,
    title: "Window 1",
    position: { x: 250, y: 250 },
    size: { width: 500, height: 300 },
    isFocused: true,
    isMaximized: false,
    isMinimized: false,
    content: windowContent, // You don't have to use a variable for the content it's just for readability
  });

  // Move the window every 500 milliseconds
  setInterval(() => {
    dispatch({
      type: "WINDOW_MOVE",
      payload: {
        id: windowID,
        position: { x: 10, y: 10 },
        relative: true,
      },
    });
  }, 500);

  // Log a message to the console
  console.log("Hello from the console!");
})();
```
