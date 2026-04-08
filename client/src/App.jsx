import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import ChatMessage from './components/ChatMessage.jsx'
import ChatInput from './components/ChatInput.jsx'
import Sidebar from './components/Sidebar.jsx'

const socket = io('/', {
  path: '/socket.io',
  transports: ['polling', 'websocket']
})

function App() {
  const [messages, setMessages] = useState([])
  const [rooms, setRooms] = useState(['general', 'dev-help', 'ai-discussion'])
  const [currentRoom, setCurrentRoom] = useState('general')
  const [username, setUsername] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('room_history', (history) => {
      setMessages(history)
    })

    socket.on('ai_typing', (typing) => {
      setIsAiTyping(typing)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('message')
      socket.off('room_history')
      socket.off('ai_typing')
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiTyping])

  const joinRoom = (room) => {
    if (username) {
      socket.emit('join_room', { room, username })
      setCurrentRoom(room)
      setMessages([])
    }
  }

  const sendMessage = (text) => {
    if (!text.trim() || !username) return
    socket.emit('send_message', {
      room: currentRoom,
      username,
      text,
      timestamp: new Date().toISOString()
    })
  }

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim())
      socket.emit('join_room', { room: currentRoom, username: usernameInput.trim() })
    }
  }

  if (!username) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">💬</div>
            <h1 className="text-2xl font-bold text-white">AI Dev Chat</h1>
            <p className="text-slate-400 mt-2 text-sm">Real-time chat with AI assistance for developers</p>
          </div>
          <form onSubmit={handleUsernameSubmit}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Choose your username
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. dev_ninja"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Enter Chat
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-slate-900">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomSelect={joinRoom}
        username={username}
        isConnected={isConnected}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center px-6 py-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white"># {currentRoom}</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full">
              🤖 AI Assistant Active
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm">No messages yet. Start chatting!</p>
              <p className="text-xs mt-1 text-slate-600">Mention <code className="bg-slate-800 px-1 rounded">@ai</code> to get help from the AI assistant</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} currentUser={username} />
          ))}
          {isAiTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
                🤖
              </div>
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <div className="typing-indicator flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full inline-block"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full inline-block"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full inline-block"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendMessage} disabled={!isConnected} />
      </div>
    </div>
  )
}

export default App
