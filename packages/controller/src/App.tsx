import axios from "axios";
import { useState, type SyntheticEvent } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8080/url",
        { url: input },
        {
          headers: {
            "Content-Type": "application/json",
            
          },
        },
      );

      setResponse(res.data.message);
      setInput("");
    } catch (error) {
      console.error(error);
      setResponse("Error sending data to server");
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-screen h-screen">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="border p-2"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Enter URL..."
        />
        <button type="submit">Submit</button>
      </form>

      <div className="flex items-center justify-center w-10 h-5 ">
        {response}
      </div>
    </div>
  );
}
