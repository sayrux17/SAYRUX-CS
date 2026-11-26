
import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "40kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "SAYRUX-CS" });
});

app.post("/api/chat", async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: "Не настроен Groq API key" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const messages = (req.body.messages || [])
      .filter(m => ["user", "assistant"].includes(m.role))
      .slice(-12);

    const result = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "Ты SAYRUX, AI-помощник по Counter-Strike 2. Отвечай на русском языке." },
        ...messages
      ]
    });

    res.json({ reply: result.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка AI. Попробуй ещё раз." });
  }
});

app.listen(PORT, () => console.log(`SAYRUX-CS running on port ${PORT}`));

