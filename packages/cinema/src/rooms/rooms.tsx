import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../constants";

export default function Rooms() {
  const { roomId } = useParams();
  const [roomUrl, setRoomUrl] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API_URL}/url/${roomId}`);
        setRoomUrl(res.data);
      } catch (error) {
        console.error(`Could not find ${roomId}:`, error);
      }
    };

    fetchRooms();
  }, [roomId]);

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      {roomUrl ? (
        <iframe
          key={roomUrl}
          src={roomUrl}
          allowFullScreen
          allow="fullscreen *; encrypted-media; clipboard-read; clipboard-write; camera; microphone"
          title={roomId}
          className="w-full h-full border-none"
        />
      ): (
        <p>Waiting For URL...</p>
      )}
    </div>
  );
}
