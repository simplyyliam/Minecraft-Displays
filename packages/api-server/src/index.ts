import cors from 'cors';
import express, { Response, Request } from "express"
const app = express()
const PORT = 8080

app.use(cors())
app.use(express.json())

app.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" })
})

app.post('/url', (req: Request, res: Response) => {
  const { url } = req.body
  if (!url) return res.status(400).send({ error: "Missign URL" })
  console.log("Recieved URL:", url)
  res.json({ message: `Server received: "${url}"` })
})

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
})