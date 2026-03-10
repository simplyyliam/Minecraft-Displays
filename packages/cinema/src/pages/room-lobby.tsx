import { Link } from "react-router-dom";

export default function RoomLobby() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-screen h-screen">
      <Link to="/room/1">Room 1</Link>
      <Link to="/room/2">Room 2</Link>
      <Link to="/room/3">Room 3</Link>
      <Link to="/room/4">Room 4</Link>
    </div>
  );
}
