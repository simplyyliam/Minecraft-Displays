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

const HIANIME = process.env.HIANIME_API_URL ?? "http://localhost:3030/api/v1";


app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${HIANIME}/health`, { timeout: 8000 });
    res.json({ status: "ok", HIANIME: response.data });
  } catch (err) {
    console.error("HIANIME healthcheck failed:", err);
    res.status(503).json({ status: "degraded", error: "HIANIME unreachable" });
  }
});


app.get("/anime/search", async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = typeof req.query.page === "string" ? req.query.page : "1";

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const response = await axios.get(
      `${HIANIME}/search?keyword=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}`,
      { timeout: 8000 },
    );
    const items = response.data?.data?.response ?? [];
    const animes = items.map((item: any) => ({
      id: item.id,
      name: item.title,
      poster: item.poster,
    }));
    res.json({ animes });
  } catch (err) {
    console.error("HIANIME search failed:", err);
    res.status(502).json({ error: `Search for ${query} failed` });
  }
});

// GET anime episode ID
app.get("/anime/episodes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${HIANIME}/episodes/${id}`, {
      timeout: 8000,
    });

    const episodes = response.data?.data ?? [];
    const normalized = episodes.map((ep: any) => ({
      title: ep.title ?? `Episode ${ep.episodeNumber ?? ""}`.trim(),
      episodeId: ep.id,
      number: ep.episodeNumber,
      isFiller: ep.isFiller,
    }));

    res.json(normalized);
  } catch (err) {
    console.error("HIANIME episodes failed:", err);
    res.status(502).json({ error: "Episode fetch failed" });
  }
}); 

// GET streaming sources (preferred: episodeId in query)
app.get("/anime/episode-src", async (req: Request, res: Response) => {
  const episodeId = typeof req.query.episodeId === "string" ? req.query.episodeId : "";
  const server = typeof req.query.server === "string" ? req.query.server : "";
  const category = typeof req.query.category === "string" ? req.query.category : "sub";

  if (!episodeId) {
    return res.status(400).json({ error: "Missing episodeId" });
  }

  try {
    const pickServer = async () => {
      if (server) return server.toLowerCase();
      const serversRes = await axios.get(
        `${HIANIME}/servers/${encodeURIComponent(episodeId)}`,
        { timeout: 8000 },
      );
      const list = serversRes.data?.data?.[category] ?? [];
      return list?.[0]?.name ?? "hd-1";
    };

    const normalizedServer = await pickServer();
    const response = await axios.get(
      `${HIANIME}/stream?id=${encodeURIComponent(
        episodeId,
      )}&server=${encodeURIComponent(
        normalizedServer,
      )}&type=${encodeURIComponent(category)}`,
      { timeout: 8000 },
    );

    const stream = Array.isArray(response.data?.data)
      ? response.data.data[0]
      : response.data?.data;
    const file = stream?.link?.file;
    if (!file) {
      return res.status(502).json({ error: "Missing stream file" });
    }

    const subtitles = (stream?.tracks ?? [])
      .filter((track: any) => track.kind === "captions" || track.kind === "subtitles")
      .map((track: any) => ({
        lang: track.label ?? "English",
        url: track.file,
      }));

    res.json({
      sources: [{ url: file }],
      subtitles,
    });
  } catch (err) {
    console.error("Failed to fetch stream sources:", err);
    res.status(502).json({ error: "Could not retrieve stream link" });
  }
});

// Backward-compatible route (episodeId in path)
app.get("/anime/episode-src/:episodeId", (req: Request, res: Response) => {
  const { episodeId } = req.params;
  const category = typeof req.query.category === "string" ? req.query.category : "sub"; // optional

  if (!episodeId) {
    return res.status(400).json({ error: "Missing episodeId" });
  }

  // For MegaPlay, s-2 seems to work, and 'sub' or 'dub' can be appended
  const megaPlayUrl = `https://megaplay.buzz/stream/s-2/${episodeId}/${category}`;

  res.json({
    sources: [{ url: megaPlayUrl }],
    subtitles: [], // if you want to add subtitles later
  });
});


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
