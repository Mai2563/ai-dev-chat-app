const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

let OpenAI;
let openai;

async function initOpenAI() {
  try {
    const openaiModule = require('openai');
    OpenAI = openaiModule.default || openaiModule.OpenAI || openaiModule;
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('OpenAI client initialized');
    } else {
      console.warn('OPENAI_API_KEY not set — AI responses will be simulated');
    }
  } catch (err) {
    console.error('Failed to load OpenAI module:', err.message);
  }
}

initOpenAI();

const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      messages: [],
      users: new Map()
    });
  }
  return rooms.get(roomId);
}

const DEFAULT_ROOMS = [
  { id: 'general', name: '# general', description: 'General developer chat' },
  { id: 'javascript', name: '# javascript', description: 'JS/TS discussions' },
  { id: 'python', name: '# python', description: 'Python discussions' },
  { id: 'devops', name: '# devops', description: 'DevOps & infrastructure' },
  { id: 'ai-ml', name: '# ai-ml', description: 'AI & Machine Learning' }
];

DEFAULT_ROOMS.forEach(r => getOrCreateRoom(r.id));

app.get('/api/rooms', (req, res) => {
  res.json(DEFAULT_ROOMS);
});

app.get('/api/rooms/:roomId/messages', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.json([]);
  res.json(room.messages.slice(-100));
});

async function getAIResponse(messages, userMessage) {
  if (!openai) {
    return simulateAIResponse(userMessage);
  }

  try {
    const systemPrompt = `You are DevBot, an AI assistant embedded in a real-time chat app for developers. 
You help with coding questions, debugging, architecture decisions, and technical discussions.
Format code blocks with the appropriate language identifier.
Be concise, accurate, and developer-friendly. Use markdown formatting.`;

    const chatHistory = messages.slice(-10).map(m => ({
      role: m.isAI ? 'assistant' : 'user',
      content: m.text
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return `Sorry, I ran into an error: ${err.message}`;
  }
}

function simulateAIResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hey there, developer! 👋 I'm DevBot, your AI coding assistant. Ask me anything about code, bugs, or architecture!";
  }
  if (lowerMsg.includes('javascript') || lowerMsg.includes('js')) {
    return "JavaScript is the language of the web! Here's a quick tip:\n\n```javascript\n// Use optional chaining to avoid TypeError\nconst value = obj?.nested?.property ?? 'default';\n```\n\nWhat specifically would you like to know about JS?";
  }
  if (lowerMsg.includes('python')) {
    return "Python is great for everything from scripts to ML! Here's a modern Python tip:\n\n```python\n# Use walrus operator for cleaner code\nif (n := len(data)) > 10:\n    print(f'List has {n} elements')\n```\n\nWhat Python topic can I help with?";
  }
  if (lowerMsg.includes('bug') || lowerMsg.includes('error') || lowerMsg.includes('debug')) {
    return "Let's debug this together! Please share:\n1. The error message\n2. The relevant code snippet\n3. What you expected vs what happened\n\nI'll help you track down the issue!";
  }
  if (lowerMsg.includes('docker') || lowerMsg.includes('kubernetes') || lowerMsg.includes('devops')) {
    return "DevOps is all about automation and reliability! A quick Docker tip:\n\n```dockerfile\n# Use multi-stage builds to keep images small\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY . .\nCMD [\"node\", \"index.js\"]\n```";
  }
  return "That's an interesting question! I'm currently in demo mode (no OpenAI key configured), but once you add your OPENAI_API_KEY, I'll give you detailed, intelligent responses. For now, try asking about JavaScript, Python, debugging, or DevOps!";
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  let currentRoom = null;
  let username = null;

  socket.on('join', ({ room, user }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      const oldRoom = rooms.get(currentRoom);
      if (oldRoom) oldRoom.users.delete(socket.id);
      socket.to(currentRoom).emit('userLeft', { user: username, room: currentRoom });
    }

    currentRoom = room;
    username = user || `Dev_${socket.id.slice(0, 6)}`;

    const roomData = getOrCreateRoom(room);
    roomData.users.set(socket.id, username);
    socket.join(room);

    socket.emit('joined', {
      room,
      username,
      messages: roomData.messages.slice(-50),
      users: Array.from(roomData.users.values())
    });

    io.to(room).emit('userList', Array.from(roomData.users.values()));

    socket.to(room).emit('userJoined', { user: username, room });
    console.log(`${username} joined room: ${room}`);
  });

  socket.on('message', async (data) => {
    const { text, room } = data;
    if (!room || !text?.trim()) return;

    const roomData = getOrCreateRoom(room);

    const userMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text.trim(),
      user: username || `Dev_${socket.id.slice(0, 6)}`,
      room,
      timestamp: new Date().toISOString(),
      isAI: false
    };

    roomData.messages.push(userMsg);
    if (roomData.messages.length > 500) roomData.messages.shift();

    io.to(room).emit('message', userMsg);

    const mentionsAI = text.toLowerCase().includes('@devbot') ||
      text.toLowerCase().includes('@ai') ||
      text.toLowerCase().startsWith('/ai ');

    if (mentionsAI) {
      socket.to(room).emit('aiTyping', { room });
      socket.emit('aiTyping', { room });

      const query = text
        .replace(/@devbot/gi, '')
        .replace(/@ai/gi, '')
        .replace(/^\/ai\s*/i, '')
        .trim();

      try {
        const aiResponse = await getAIResponse(roomData.messages.slice(-15), query || text);

        const aiMsg = {
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text: aiResponse,
          user: 'DevBot',
          room,
          timestamp: new Date().toISOString(),
          isAI: true
        };

        roomData.messages.push(aiMsg);
        if (roomData.messages.length > 500) roomData.messages.shift();

        io.to(room).emit('message', aiMsg);
        io.to(room).emit('aiDoneTyping', { room });
      } catch (err) {
        console.error('AI response error:', err);
        io.to(room).emit('aiDoneTyping', { room });
      }
    }
  });

  socket.on('typing', ({ room, user }) => {
    socket.to(room).emit('typing', { user, room });
  });

  socket.on('stopTyping', ({ room }) => {
    socket.to(room).emit('stopTyping', { user: username, room });
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      const roomData = rooms.get(currentRoom);
      if (roomData) {
        roomData.users.delete(socket.id);
        io.to(currentRoom).emit('userLeft', { user: username, room: currentRoom });
        io.to(currentRoom).emit('userList', Array.from(roomData.users.values()));
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SERVER_PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
