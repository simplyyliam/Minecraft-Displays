import axios, { AxiosError } from "axios";
import { useState, type SyntheticEvent } from "react";
import { API_URL, API_URL_ERROR } from "./constants";

export default function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const [roomId, setRoomId] = useState("1");

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
    <div className="flex flex-col gap-10 items-center justify-center w-screen h-screen">
      <form onSubmit={handleSubmit}>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2"
        >
          <option value="1">Room 1</option>
          <option value="2">Room 2</option>
          <option value="3">Room 3</option>
          <option value="4">Room 4</option>
        </select>
        <input
          type="text"
          className="border p-2"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Enter URL..."
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={handleClear} className="ml-2">
          Clear
        </button>
      </form>

      <div className="flex items-center justify-center w-10 h-5 ">
        {response}
      </div>
    </div>
  );
}
