import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import cheerio from "cheerio";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
const rooms = {};
const normalizeUrl = (url) => /^https?:\/\//i.test(url) ? url : `https://${url}`;
const animeClient = axios.create({
    timeout: 15000,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://hianime.to/"
    }
});
const parseAnimeResults = (html) => {
    const $ = cheerio.load(html);
    const seen = new Set();
    const results = [];
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
app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
});
// POST Rooms
app.post("/url", (req, res) => {
    console.log("Request method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Raw body:", req.body);
    const { roomId, url } = req.body;
    if (!roomId || !url) {
        return res.status(400).json({ error: "Missing RoomId or URL" });
    }
    ;
    console.log("Received URL:", url);
    rooms[roomId] = normalizeUrl(url);
    console.log(`Room ${roomId} now playing: ${url}`);
    res.json({ message: `Room ${roomId} updated` });
});
// GET Rooms
app.get("/url/:roomId", (req, res) => {
    // Gets the params from POST
    const { roomId } = req.params;
    const url = rooms[roomId];
    if (!url) {
        return res.status(404).json({ error: "No movie in this room yet" });
    }
    res.json({ url });
});
// DELETE Room URL
app.delete("/url/:roomId", (req, res) => {
    const { roomId } = req.params;
    if (!rooms[roomId]) {
        return res.status(404).json({ error: "No movie in this room yet" });
    }
    delete rooms[roomId];
    res.json({ message: `Room ${roomId} cleared` });
});
// Search for animes
app.get("/anime/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Missing search query" });
    }
    try {
        const normalizedQuery = query.replace(/-/g, " ").trim();
        const pageResponse = await animeClient.get(`https://hianime.to/search?keyword=${encodeURIComponent(normalizedQuery)}`);
        const pageResults = parseAnimeResults(pageResponse.data);
        if (pageResults.length > 0) {
            return res.json({ source: "search-page", count: pageResults.length, results: pageResults });
        }
        const suggestResponse = await animeClient.get(`https://hianime.to/ajax/search/suggest?keyword=${encodeURIComponent(normalizedQuery)}`, { headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json, text/plain, */*" } });
        let suggestHtml = "";
        if (typeof suggestResponse.data === "string") {
            suggestHtml = suggestResponse.data;
        }
        else if (suggestResponse.data && typeof suggestResponse.data.html === "string") {
            suggestHtml = suggestResponse.data.html;
        }
        const suggestResults = suggestHtml ? parseAnimeResults(suggestHtml) : [];
        return res.json({
            source: "search-suggest",
            count: suggestResults.length,
            results: suggestResults
        });
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const bodyPreview = typeof error.response?.data === "string"
                ? error.response.data.slice(0, 180)
                : "";
            console.error("Anime search request failed", {
                query,
                status,
                message: error.message,
                bodyPreview
            });
            return res.status(502).json({
                error: "Failed to search anime",
                details: status ? `Upstream responded with ${status}` : "Upstream request failed"
            });
        }
        console.error("Anime search parsing failed", error);
        res.status(500).json({ error: "Failed to search anime" });
    }
});
app.get("/anime/episodes", async (req, res) => {
    const animeUrl = req.query.url;
    if (!animeUrl) {
        return res.status(404).json({ error: "Missing anime URL" });
    }
    try {
        const response = await axios.get(animeUrl);
        const $ = cheerio.load(response.data);
        const episodes = [];
        $(".ep-item").each((_, el) => {
            const epId = $(el).attr("data-id");
            const epNum = $(el).text().trim();
            episodes.push({
                episode: epNum,
                url: `${animeUrl}?ep=${epId}`
            });
        });
        res.json(episodes);
        console.log(`
      AnimeUrl: ${animeUrl}
      Cheerio Data: ${$}
      Episodes: ${episodes}
      `);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch episodes" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is alive on http://localhost:${PORT}🚀`);
});
