require('dotenv').config()
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')
const OpenAI = require('openai')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const roomHistory = {}

function getRoomHistory(room) {
  if (!roomHistory[room]) roomHistory[room] = []
  return roomHistory[room]
}

function addMessage(room, msg) {
  const history = getRoomHistory(room)
  history.push(msg)
  if (history.length > 100) history.shift()
  return msg
}

async function getAiResponse(room, userMessage, username) {
  const systemPrompt = `You are a helpful AI assistant in a developer chat room called "${room}". 
You help developers with coding questions, debugging, architecture decisions, and tech discussions.
Keep responses concise and use code blocks when sharing code. 
Format code with triple backticks and the language name (e.g. \`\`\`javascript).`

  const history = getRoomHistory(room)
  const recentMessages = history.slice(-10).filter(m => !m.isAi || m.text.length < 500)

  const chatHistory = recentMessages.map(m => ({
    role: m.isAi ? 'assistant' : 'user',
    content: m.isAi ? m.text : `${m.username}: ${m.text}`
  }))

  if (!openai) {
    return `I'm the AI assistant! It looks like no OpenAI API key is configured yet. Once you add the \`OPENAI_API_KEY\` secret, I'll be able to help you with coding questions, debugging, and more. You can still use this chat for team collaboration without AI features!`
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: `${username} asks: ${userMessage}` }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
    return completion.choices[0].message.content
  } catch (err) {
    console.error('OpenAI error:', err.message)
    return `Sorry, I encountered an error connecting to the AI service. Please try again later.`
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  let currentRoom = null
  let currentUsername = null

  socket.on('join_room', ({ room, username }) => {
    if (currentRoom) socket.leave(currentRoom)
    socket.join(room)
    currentRoom = room
    currentUsername = username

    socket.emit('room_history', getRoomHistory(room))

    const joinMsg = addMessage(room, {
      username: 'System',
      text: `${username} joined #${room}`,
      timestamp: new Date().toISOString(),
      isSystem: true
    })
    io.to(room).emit('message', joinMsg)
    console.log(`${username} joined room: ${room}`)
  })

  socket.on('send_message', async ({ room, username, text, timestamp }) => {
    const msg = addMessage(room, { username, text, timestamp, isAi: false })
    io.to(room).emit('message', msg)

    const mentionsAi = text.toLowerCase().includes('@ai')
    if (mentionsAi) {
      io.to(room).emit('ai_typing', true)
      try {
        const aiText = await getAiResponse(room, text.replace(/@ai/gi, '').trim(), username)
        const aiMsg = addMessage(room, {
          username: 'AI Assistant',
          text: aiText,
          timestamp: new Date().toISOString(),
          isAi: true
        })
        io.to(room).emit('message', aiMsg)
      } finally {
        io.to(room).emit('ai_typing', false)
      }
    }
  })

  socket.on('disconnect', () => {
    if (currentRoom && currentUsername) {
      const leaveMsg = addMessage(currentRoom, {
        username: 'System',
        text: `${currentUsername} left the chat`,
        timestamp: new Date().toISOString(),
        isSystem: true
      })
      io.to(currentRoom).emit('message', leaveMsg)
    }
    console.log('Client disconnected:', socket.id)
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ai: !!openai })
})

const clientDist = path.join(__dirname, '..', 'client', 'dist')
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`AI features: ${openai ? 'enabled' : 'disabled (no OPENAI_API_KEY)'}`)
})
