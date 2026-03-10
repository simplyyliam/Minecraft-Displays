import axios from 'axios';
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
const app = express();
const PORT = process.env.PORT || 8080

app.use(cors());
app.use(express.json());

const rooms: Record<string, string> = {}

const ANIWATCH = process.env.ANIWATCH_URL ?? "http://localhost:4000/api/v2/hianime";


app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ANIWATCH}/ping`, { timeout: 8000 });
    res.json({ status: "ok", aniwatch: response.data });
  } catch (err) {
    console.error("ANIWATCH healthcheck failed:", err);
    res.status(503).json({ status: "degraded", error: "ANIWATCH unreachable" });
  }
});


app.get("/anime/search", async (req: Request, res: Response) => {
  const query = req.query.q as string

  try {
    const response = await axios.get(
      `${ANIWATCH}/search?q=${encodeURIComponent(query)}`,
      { timeout: 8000 },
    )
    res.json(response.data.data)
  } catch (err) {
    console.error("ANIWATCH search failed:", err)
    res.status(502).json({ error: `Search for ${query} failed` })
  }
})

// GET anime episode ID
app.get("/anime/episodes/:id", async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const response = await axios.get(`${ANIWATCH}/anime/${id}/episodes`, {
      timeout: 8000,
    })
    res.json(response.data.data.episodes)
    
  } catch (err) {
    console.error("ANIWATCH episodes failed:", err)
    res.status(502).json({ error: "Episode fetch failed" })
  }
})


// POST Rooms
app.post("/url", (req: Request<{}, {}, { roomId: string; url: string }>, res: Response) => {
  console.log("Request method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Raw body:", req.body);

  const { roomId, url } = req.body;
  if (!roomId || !url) {
    return res.status(400).json({ error: "Missing RoomId or URL" })
  };
  console.log("Received URL:", url);

  rooms[roomId] = url
  console.log(`Room ${roomId} now playing: ${url}`)

  res.json({ message: `Room ${roomId} updated` });
});

// GET Rooms
app.get("/url/:roomId", (req: Request, res: Response) => {
  // Gets the params from POST
  const { roomId } = req.params
  const url = rooms[roomId]

  if (!url) {
    return res.status(404).json({ error: "No movie in this room yet" })
  }

  res.json({ url })
});

// DELETE Room URL
app.delete("/url/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;

  if (!rooms[roomId]) {
    return res.status(404).json({ error: "No movie in this room yet" });
  }

  delete rooms[roomId];
  res.json({ message: `Room ${roomId} cleared` });
});

app.listen(PORT, () => {
  console.log(`Server is alive on http://localhost:${PORT}🚀`)
})
