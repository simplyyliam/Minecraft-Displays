import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv"
import axios from "axios";
import cheerio from "cheerio";

dotenv.config()
const app = express();
const PORT = process.env.PORT || 8080

app.use(cors());
app.use(express.json());

const rooms: Record<string, string> = {}

const normalizeUrl = (url: string) => /^https?:\/\//i.test(url) ? url : `https://${url}`;
const animeClient = axios.create({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://hianime.to/"
  }
});

const parseAnimeResults = (html: string) => {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const results: Array<{ title: string; url: string }> = [];

  const selector = ".film-name a, .flw-item .film-detail .film-name a, a[href*='/watch/']";
  $(selector).each((_, el) => {
    const title = $(el).text().trim();
    const href = $(el).attr("href");
    if (!title || !href) {
      return;
    }

    const absoluteUrl = href.startsWith("http") ? href : `https://hianime.to${href}`;
    if (seen.has(absoluteUrl)) {
      return;
    }

    seen.add(absoluteUrl);
    results.push({ title, url: absoluteUrl });
  });

  return results;
};


app.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
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

  rooms[roomId] = normalizeUrl(url)
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
