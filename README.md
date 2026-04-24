# 💬 AI Real-Time Chat App
Live Demo 👉 [Demo](https://ai-dev-chat-app--mai2563.replit.app/)

A real-time chat application built with Node.js, Express, Socket.IO, and OpenAI API
Supports multi-user messaging, AI responses, and mobile-friendly UI.

## 🚀 Features
- ⚡ Real-time chat (Socket.IO)
- 👥 Multi-user messaging
- 🤖 AI chatbot (OpenAI)
- 💬 Typing indicator
- 📱 Mobile responsive (iPhone supported)
- 🎨 Messenger-style UI
- ⌨️ Press Enter to send
- 🔄 Auto scroll
- 
## 🛠️ Tech Stack
### Frontend
- HTML
- CSS
- JavaScript
- Socket.IO Client
### Backend
- Node.js
- Express
- Socket.IO
- OpenAI API

## 📁 Project Structure
```
ai-dev-chat-app/
├── backend/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── index.html
│   └── app.js
└── README.md
```

## ⚙️ Setup
### 1. Install dependencies
```
cd backend
npm install
```
### 2. Add API Key
Create .env in /backend
```
OPENAI_API_KEY=your_api_key_here
```

## ▶️ Run
```
node backend/index.js
```
Open:
```
http://localhost:3000
```

## 🤖 AI Example
```
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: message },
  ],
});
```

## ⚠️ Notes
- ถ้าเจอ error 429
→ quota หมด / billing ยังไม่ active
- ห้ามเอา API key ไปไว้ frontend

## 👨‍💻 Author
### Nawaphat.S

## ⭐️ Support
If you like this project, give it a ⭐ on GitHub

## 📜 License
MIT

