import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, API_URL_ERROR } from "../constants";

export default function RoomDisplay() {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomUrl, setRoomUrl] = useState("");

  useEffect(() => {
    if (!roomId) return;

    const normalizeUrl = (url: string) =>
      /^https?:\/\//i.test(url) ? url : `https://${url}`;

    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API_URL}/url/${roomId}`);
        // Avoides random updates
        setRoomUrl((prev) => {
          const newUrl = normalizeUrl(res.data.url);
          return prev === newUrl ? prev : newUrl;
        });
      } catch (error) {
        console.error(`Could not find ${roomId}:`, error);
        setRoomUrl("");
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

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
      {roomUrl ? (
        <iframe
          key={roomUrl}
          src={roomUrl}
          allowFullScreen
          allow="fullscreen *; encrypted-media"
          title={`Room ${roomId}`}
          className="w-full h-full border-none"
        />
      ) : (
        <p>Waiting For URL...</p>
      )}
    </div>
  );
}
