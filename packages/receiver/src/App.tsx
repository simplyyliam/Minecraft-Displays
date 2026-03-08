import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL, API_URL_ERROR } from "./constants";

export default function App() {
  const [latestResponse, setLatestResponse] = useState("");

    useEffect(() => {
    const fetchLatestUrl = async () => {
      try {
        const res = await axios.get(`${API_URL}/url`);
        // Ensure you aren't double-adding https://
        const url = res.data.url.replace(/^https?:\/\//, "");
        setLatestResponse(url);
      } catch (error) {
        console.error("Fetch error:", error);
        setLatestResponse(""); 
      }
    };

    fetchLatestUrl();
    const interval = setInterval(fetchLatestUrl, 2000);
    return () => clearInterval(interval);
  }, []);

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
      {latestResponse ? (
        <iframe
          key={latestResponse}
          is="x-frame-bypass"
          src={`https://${latestResponse}`}
          allowFullScreen
          allow="fullscreen encrypted-media clipboard-read clipboard-write camera microphone "
          title="Remote Display"
          className="w-full h-full border-none"
        ></iframe>
      ) : (
        <p>Waiting for URL...</p>
      )}
    </div>
  );
}
