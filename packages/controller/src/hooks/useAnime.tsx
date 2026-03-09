import axios, { AxiosError } from "axios";
import { useEffect, useState, type SyntheticEvent } from "react";
import { API_URL } from "../constants";

type Anime = {
  id: string;
  name: string;
  poster: string;
};

export default function useAnime() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [roomId, setRoomId] = useState("1");

  useEffect(() => {
    if (!input) return;
    const fetchAnimeList = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/anime/search?q=${encodeURIComponent(input)}`,
        );
        setAnimeList(res.data.animes);
      } catch (error) {
        console.error(`Could not find anime called ${input}`, error);
      }
    };

    fetchAnimeList();
  }, [input]);

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
      const ServerMessage = err.response?.data.error;
      const status = err.response?.status;

      console.error("Failed to send URL:", {
        message: err.message,
        status,
        respone: err.response?.data,
      });
      setResponse(
        ServerMessage
          ? `Server error (${status ?? "unknown"}): ${ServerMessage}`
          : `Request failed ${err.message}`,
      );
    }
  };

  const handleClear = async () => {
    try {
      const res = await axios.delete(`${API_URL}/url/${roomId}`);
      setResponse(res.data.message);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      const serverMessage = err.response?.data.error;
      const status = err.response?.status;

      setResponse(
        serverMessage
          ? `Server error (${status ?? "unknown"}): ${serverMessage}`
          : `Request failed: ${err.message}`,
      );
    }
  };

  return {
    response,
    animeList,
    input,
    setInput,
    setRoomId,
    roomId,
    handleSubmit,
    handleClear
  }
}
