import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "40kb" }));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "SAYRUX-CS" }));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
const windows = new Map();
const LIMIT = 12;
const WINDOW_MS = 60_000;

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip;
  const entry = windows.get(key) || { count: 0, reset: now + WINDOW_MS };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + WINDOW_MS;
  }
  entry.count += 1;
  windows.set(key, entry);
  if (entry.count > LIMIT) {
    return res.status(429).json({ error: "Слишком много запросов. Попробуй через минуту." });
  }
  next();
}



app.post("/api/chat", rateLimit, async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Сервер ещё не настроен: добавь GROQ_API_KEY в переменные окружения." });

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const safeMessages = messages
    .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Отправь сообщение, чтобы начать диалог." });
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });
    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "Ты SAYRUX, дружелюбный AI-помощник по Counter-Strike 2 и киберспорту. Отвечай на русском, если пользователь пишет по-русски. Помогай с тактиками, картами, тренировками, настройками, ролями и разбором матчей. Не выдумывай актуальные результаты турниров."
        },
        ...safeMessages
      ],
      temperature: 0.7,
      max_tokens: 900
    });
    res.json({ reply: completion.choices?.[0]?.message?.content || "Не получилось сформировать ответ." });
  } catch (error) {
    console.error("Groq API error:", error?.message || error);
    res.status(502).json({ error: "Не удалось получить ответ от AI. Проверь настройки Groq и попробуй снова." });
  }
});

app.listen(PORT, () => console.log(`SAYRUX-CS running on port ${PORT}`));
