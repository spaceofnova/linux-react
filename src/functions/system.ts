import { useLogStore } from "@/stores/logstore";

declare global {
  interface Window {
    system: typeof system;
  }
}

export const system = {
  log: (message: string) => {
    console.log(message);
    useLogStore.getState().log(message);
  }
  // Add more methods here as needed
};

window.system = system;
