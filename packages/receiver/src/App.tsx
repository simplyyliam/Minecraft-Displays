import axios from "axios";
import { useEffect, useState } from "react";

export default function App() {
  const [latestResponse, setLatestResponse] = useState("");

  useEffect(() => {
    const fetchLatestUrl = async () => {
      try {
        const res = await axios.get("http://localhost:8080/url");
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

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      {latestResponse ? (
        <iframe
          key={latestResponse}
          is="x-frame-bypass"
          src={`https://${latestResponse}`}
          className="w-full h-full border-none"
        ></iframe>
      ) : (
        <p>Waiting for URL...</p>
      )}
    </div>
  );
}
