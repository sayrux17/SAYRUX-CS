# SAYRUX-CS — Black Edition

Тёмный сайт о Counter-Strike 2 с AI-чатом на Groq.

## Локальный запуск

1. Установи Node.js 20 или новее.
2. Скопируй `.env.example` в `.env`.
3. В `.env` укажи свой `GROQ_API_KEY`. Не публикуй этот файл и не вставляй ключ в HTML.
4. Установи зависимости: `npm install`
5. Запусти: `npm start`
6. Открой `http://localhost:3000`.

## Деплой на Render

- Создай Web Service из GitHub-репозитория.
- Build Command: `npm install`
- Start Command: `npm start`
- В Environment добавь:
  - `GROQ_API_KEY` — твой секретный ключ Groq
  - `GROQ_MODEL` — `openai/gpt-oss-20b`
- После деплоя проверь `/api/health`.

API-ключ хранится только на сервере в переменных окружения. Не добавляй `.env` в GitHub.
