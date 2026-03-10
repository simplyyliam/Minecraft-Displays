import { createBrowserRouter } from "react-router-dom";
import RoomLobby from "./pages/room-lobby";
import RoomDisplay from "./pages/room-display";

export const Router = createBrowserRouter([
  {
    element: <RoomLobby />,
    index: true,
  },

  {
    element: <RoomDisplay />,
    path: "/room/:roomId",
  },
]);
