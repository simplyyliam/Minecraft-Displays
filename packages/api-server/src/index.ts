import cors from 'cors';
import express, { Response, Request } from "express"
const app = express()
const PORT = 8080

let lastUrl = ""

app.use(cors())
app.use(express.json())

app.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" })
})

app.post('/url', (req: Request<{}, {}, { url: string }>, res: Response) => {
  console.log('Request method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Raw body:', req.body);
  const { url } = req.body;
  if (!url) return res.status(400).send({ error: "Missing URL" });
  console.log("Received URL:", url);
  lastUrl = url;
  res.json({ message: `Server received: "${url}"` });
});

app.get('/url', (req: Request, res: Response) => {
  if (!lastUrl) return res.status(400).send({ error: "No URL submitted yet" });
  res.json({ url: `${lastUrl}` });
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
})