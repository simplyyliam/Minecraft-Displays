import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080

app.use(cors());
app.use(express.json());

let lastUrl = "";

app.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.post("/url", (req: Request<{}, {}, { url: string }>, res: Response) => {
  console.log("Request method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Raw body:", req.body);

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  console.log("Received URL:", url);
  lastUrl = url;

  res.json({ message: `Server received: "${url}"` });
});

app.get("/url", (req: Request, res: Response) => {
  if (!lastUrl) return res.status(400).json({ error: "No URL submitted yet" });
  res.json({ url: lastUrl });
});

app.listen(PORT, () => {
  console.log(`Server is alive on http://localhost:${PORT}🚀`)
})