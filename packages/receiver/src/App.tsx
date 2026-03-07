import axios from "axios";
import { useEffect, useState } from "react";

export default function App() {
  const [latestResponse, setLatestResponse] = useState("")


  useEffect(() => {

    const fetchLatestUrl = async () => {
      try {
        const res = await axios.get("http://localhost:8080/url")
        setLatestResponse(res.data.url)
      } catch (error) {
        console.error(error)
        setLatestResponse("No URL submitted yet or error fetching data")
      }
    }

    fetchLatestUrl()
  }, [])
  
  return (  
    <div className="flex items-center justify-center w-screen h-screen ">
      <iframe src={`https://${latestResponse}`} className="w-full h-full"></iframe>
    </div>
  );
}
