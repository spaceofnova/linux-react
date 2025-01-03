import { useWindowStore } from "@/stores/windowStore";

// Receiver for handling dispatched events
class DispatchReceiver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<string, Set<(payload: any) => void>>;

  constructor() {
    this.listeners = new Map();
    this.initialize();
  }

  private initialize() {
    // Add event listener for the DISPATCHER custom event
    window.addEventListener("DISPATCHER", ((event: Event) => {
      if (event instanceof CustomEvent) {
        this.handleEvent(event);
      }
    }) as EventListener);
  }

  // Register a listener for a specific event type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(type: string, callback: (payload: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  // Remove a specific listener for an event type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(type: string, callback: (payload: any) => void) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(callback);
    }
  }

  // Remove all listeners for a specific event type
  removeAllListeners(type: string) {
    this.listeners.delete(type);
  }

  // Internal method to handle dispatched events
  private handleEvent(event: CustomEvent) {
    const { type, payload } = event.detail;

    // Get listeners for this event type
    const typeListeners = this.listeners.get(type);

    if (typeListeners) {
      // Call each registered listener
      typeListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in listener for ${type}:`, error);
        }
      });
    }
  }
}

// Create a singleton instance
const dispatchReceiver = new DispatchReceiver();

// Example usage
export function setupWindowEventHandlers() {
  // Listen for window creation events
  dispatchReceiver.on("WINDOW_CREATE", (payload) => {
    console.log("Window Created:", payload);
    useWindowStore.getState().createWindow({
      ...payload,
    });
  });

  dispatchReceiver.on("WINDOW_FOCUS", (payload) => {
    console.log("Window Focused:", payload);
    useWindowStore.getState().focusWindow(payload.id);
  });

  dispatchReceiver.on("WINDOW_CLOSE", (payload) => {
    console.log("Window Closed:", payload);
    useWindowStore.getState().closeWindow(payload.id);
  });

  dispatchReceiver.on("WINDOW_MAXIMIZE", (payload) => {
    console.log("Window Maximized:", payload);
    useWindowStore.getState().maximizeWindow(payload.id);
  });

  dispatchReceiver.on("WINDOW_MINIMIZE", (payload) => {
    console.log("Window Minimized:", payload);
    useWindowStore.getState().minimizeWindow(payload.id);
  });

  dispatchReceiver.on("WINDOW_RESTORE", (payload) => {
    console.log("Window Restored:", payload);
    useWindowStore.getState().restoreWindow(payload.id);
  });

  dispatchReceiver.on("WINDOW_MOVE", (payload) => {
    console.log("Window Moved:", payload);
    useWindowStore
      .getState()
      .moveWindow(payload.id, payload.position, payload.relative);
  });

  // Listen for window resize events
  dispatchReceiver.on("WINDOW_RESIZE", (payload) => {
    console.log("Window Resized:", payload);
    useWindowStore
      .getState()
      .resizeWindow(payload.id, payload.size, payload.position);
  });
}

// Export the receiver for more flexible usage
export default dispatchReceiver;
