import { createBrowserRouter } from "react-router-dom";
import Lobby from "./lobby/lobby";
import Rooms from "./rooms/rooms";

export const Router = createBrowserRouter([
  {
    element: <Lobby />,
    index: true,
  },

  {
    element: <Rooms />,
    path: "/room/:roomId",
  },
]);
