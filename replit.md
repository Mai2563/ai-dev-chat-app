# AI Dev Chat App

AI-powered real-time chat system for developers.

## Architecture

- **Frontend**: React (Vite), Tailwind CSS — runs on port 5000
- **Backend**: Node.js, Express, Socket.io — runs on port 3001

## Features

- Real-time multi-room chat using Socket.io
- AI assistant integration (OpenAI GPT-3.5) — mention `@ai` in chat
- Three default rooms: `general`, `dev-help`, `ai-discussion`
- Dark-themed developer-focused UI

## Setup

1. Start workflow: `bash start.sh` — launches both backend and frontend
2. Add `OPENAI_API_KEY` secret to enable AI features
3. Visit port 5000 to use the app

## Project Structure

```
├── server/
│   └── index.js          # Express + Socket.io backend
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main React app
│   │   ├── components/
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js    # Vite config with proxy to backend
│   └── package.json
├── package.json           # Root with concurrently
└── start.sh               # Startup script
```

## Environment Variables

- `OPENAI_API_KEY` (secret) — Required for AI assistant features
- `PORT` (optional) — Backend port, defaults to 3001
