import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./components/App";
import Home from "./components/Home";
import Search from "./components/Search";
import Settings from "./components/Settings";
import AppView from "./components/AppView";
import Apps from "./components/Apps";

const router = createMemoryRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "s/:search",
        element: <Search />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "apps",
        element: <Apps />,
      },
      {
        path: "app/:id",
        element: <AppView />,
      },
    ],
  },
]);
export const AppStore = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
