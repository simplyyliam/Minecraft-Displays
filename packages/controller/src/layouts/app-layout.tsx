import { API_URL_ERROR } from "../constants";
import { Outlet } from "react-router-dom";
import useAnimeController from "../hooks/use-anime-controller";

export default function AppLayout() {
  const anime = useAnimeController();
  const { handleClear, handleSubmit, setRoomId, roomId, input, setInput, response } =
    anime;

  if (API_URL_ERROR) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center w-screen h-screen p-6 text-center">
        <h1 className="text-xl font-semibold">Configuration error</h1>
        <p>{API_URL_ERROR}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="flex flex-col p-2 gap-2.5 w-200 h-150 border-2">
        <form onSubmit={handleSubmit} className="flex w-full h-fit gap-2">
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="border-2 p-2"
          >
            <option value="1">Room 1</option>
            <option value="2">Room 2</option>
            <option value="3">Room 3</option>
            <option value="4">Room 4</option>
          </select>
          <input
            type="text"
            className="border-2 p-2 w-full"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Enter URL..."
          />
          <button type="submit" className="border-2 w-1/4">
            Submit
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="border-2 w-1/4"
          >
            Clear
          </button>
        </form>
        <div className="border-2 w-full h-full overflow-hidden overflow-y-auto">
          <Outlet context={anime} />
        </div>
        <div className="border-2 w-full h-fit p-2">
          {response ? <p>{response}</p> : <p>No URL found in this Room</p>}
        </div>
      </div>
    </div>
  );
}
