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

// Search for animes
app.get("/anime/search", async (req: Request, res: Response) => {
  const query = req.query.q as string

  if (!query) {
    return res.status(404).json({ error: "Missing search query" })
  }

  try {
    const response = await axios.get(
      `https://hianime.to/search?keyword=${encodeURIComponent(query)}`
    )
    const $ = cheerio.load(response.data)


    const results: any[] = []

    $(".film-name a").each((_, el) => {
      const title = $(el).text().trim()
      const href = $(el).attr("href")

      results.push({
        title,
        url: "https://hianime.to" + href
      })
    })

    res.json(results)
    console.log(
      `
      Query" ${query}
      Cheerio Data: ${$}
      Results: ${results}
      `
    )
  } catch (error) {
    res.status(500).json({ error: "Failed to search anime" })
  }
})


app.get("/anime/episodes", async (req: Request, res: Response) => {
  const animeUrl = req.query.url as string
  if (!animeUrl) {
    return res.status(404).json({ error: "Missing anime URL" })
  }

  try {
    const response = await axios.get(animeUrl)
    const $ = cheerio.load(response.data)
    const episodes: any[] = []

    $(".ep-item").each((_, el) => {
      const epId = $(el).attr("data-id")
      const epNum = $(el).text().trim()

      episodes.push({
        episode: epNum,
        url: `${animeUrl}?ep=${epId}`

      })
    })

    res.json(episodes)

    console.log(
      `
      AnimeUrl: ${animeUrl}
      Cheerio Data: ${$}
      Episodes: ${episodes}
      `
    )

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch episodes" })
  }

})

app.listen(PORT, () => {
  console.log(`Server is alive on http://localhost:${PORT}🚀`)
})
