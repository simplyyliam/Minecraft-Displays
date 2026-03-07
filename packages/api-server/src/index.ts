const express = require("express")

const app = express()
const PORT = 8080

app.get("/ping", (_req: any, res: { json: (arg0: { message: string }) => void }) => {
  res.json({ message: "pong" })
})

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
})