import axios, { AxiosError } from "axios";
import { useEffect, useState, type SyntheticEvent } from "react";
import { API_URL, API_URL_ERROR } from "./constants";

type Anime = {
  id: string;
  name: string;
  poster: string;
};

export default function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const [animeList, setAnimeList] = useState<Anime[]>([]);

  const [roomId, setRoomId] = useState("1");

  useEffect(() => {
    if (!input) return;
    const fetchAnimeList = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/anime/search?q=${input}`,
        );
        setAnimeList(res.data.animes);
      } catch (error) {
        console.error("Could not find anime for that item", error);
      }
    };
    fetchAnimeList();
  }, [input]);

  if (API_URL_ERROR) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center w-screen h-screen p-6 text-center">
        <h1 className="text-xl font-semibold">Configuration error</h1>
        <p>{API_URL_ERROR}</p>
      </div>
    );
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/url`,
        { roomId, url: input },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setResponse(res.data.message);
      setInput("");
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      const serverMessage = err.response?.data?.error;
      const status = err.response?.status;

      console.error("Failed to send URL:", {
        message: err.message,
        status,
        response: err.response?.data,
      });

      setResponse(
        serverMessage
          ? `Server error (${status ?? "unknown"}): ${serverMessage}`
          : `Request failed: ${err.message}`,
      );
    }
  };

  const handleClear = async () => {
    try {
      const res = await axios.delete(`${API_URL}/url/${roomId}`);
      setResponse(res.data.message);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      const serverMessage = err.response?.data?.error;
      const status = err.response?.status;

      setResponse(
        serverMessage
          ? `Server error (${status ?? "unknown"}): ${serverMessage}`
          : `Request failed: ${err.message}`,
      );
    }
  };

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
          {animeList.map((list) => (
            <div key={list.id} className="">
              {list.name}
            </div>
          ))}
        </div>
        <div className="border-2 w-full h-fit p-2">
          {response ? <p>{response}</p> : <p>No URL found in this Room</p>}
        </div>
      </div>
    </div>
  );
}
