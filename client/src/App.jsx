import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar.jsx';
import MessageList from './components/MessageList.jsx';
import ChatInput from './components/ChatInput.jsx';
import UsernameModal from './components/UsernameModal.jsx';

const ROOM_INFO = {
  general: { emoji: '💬', description: 'General developer chat — all topics welcome' },
  javascript: { emoji: '🟨', description: 'JavaScript & TypeScript discussions' },
  python: { emoji: '🐍', description: 'Python discussions & help' },
  devops: { emoji: '⚙️', description: 'DevOps, Docker, Kubernetes & infrastructure' },
  'ai-ml': { emoji: '🤖', description: 'AI, Machine Learning & data science' }
};

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('devchat-username') || '');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [aiTyping, setAiTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimersRef = useRef({});

  const initSocket = useCallback((user) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', { room: currentRoom, user });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('joined', ({ messages: msgs, users: roomUsers, username: assignedUsername }) => {
      setMessages(msgs);
      setUsers(roomUsers);
      if (assignedUsername && assignedUsername !== user) {
        setUsername(assignedUsername);
        localStorage.setItem('devhat-username', assignedUsername);
      }
    });

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('userList', (userList) => setUsers(userList));

    socket.on('typing', ({ user: typingUser }) => {
      setTypingUsers(prev => new Set([...prev, typingUser]));
      clearTimeout(typingTimersRef.current[typingUser]);
      typingTimersRef.current[typingUser] = setTimeout(() => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(typingUser);
          return next;
        });
      }, 3000);
    });

    socket.on('stopTyping', ({ user: typingUser }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(typingUser);
        return next;
      });
    });

    socket.on('aiTyping', () => setAiTyping(true));
    socket.on('aiDoneTyping', () => setAiTyping(false));

    socket.on('userJoined', ({ user: joinedUser }) => {
      if (joinedUser !== user) {
        const notice = {
          id: `notice-${Date.now()}`,
          text: `${joinedUser} joined the channel`,
          user: 'System',
          timestamp: new Date().toISOString(),
          isSystem: true
        };
        setMessages(prev => [...prev, notice]);
      }
    });

    socket.on('userLeft', ({ user: leftUser }) => {
      const notice = {
        id: `notice-${Date.now()}`,
        text: `${leftUser} left the channel`,
        user: 'System',
        timestamp: new Date().toISOString(),
        isSystem: true
      };
      setMessages(prev => [...prev, notice]);
    });

    return socket;
  }, []);

  useEffect(() => {
    if (!username) return;
    const socket = initSocket(username);
    return () => socket.disconnect();
  }, [username]);

  const handleRoomChange = useCallback((room) => {
    if (room === currentRoom) return;
    setCurrentRoom(room);
    setMessages([]);
    setUsers([]);
    setTypingUsers(new Set());
    setAiTyping(false);
    socketRef.current?.emit('join', { room, user: username });
  }, [currentRoom, username]);

  const handleSend = useCallback((text) => {
    socketRef.current?.emit('message', { text, room: currentRoom });
  }, [currentRoom]);

  const handleTyping = useCallback(() => {
    socketRef.current?.emit('typing', { room: currentRoom, user: username });
  }, [currentRoom, username]);

  const handleStopTyping = useCallback(() => {
    socketRef.current?.emit('stopTyping', { room: currentRoom });
  }, [currentRoom]);

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    localStorage.setItem('devhat-username', name);
  };

  const roomInfo = ROOM_INFO[currentRoom] || {};

  if (!username) {
    return <UsernameModal onSubmit={handleUsernameSubmit} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentRoom={currentRoom}
        onRoomChange={handleRoomChange}
        users={users}
        connected={connected}
        username={username}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-secondary)',
          flexShrink: 0
        }}>
          <span style={{ fontSize: 18 }}>{roomInfo.emoji}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
              #{currentRoom}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {roomInfo.description}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--ai-color)',
                display: 'inline-block'
              }} />
              <span style={{ color: 'var(--ai-color)', fontWeight: 500 }}>DevBot</span>
              <span> — mention @devbot for AI help</span>
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              {users.length} online
            </div>
          </div>
        </div>

        <MessageList
          messages={messages}
          username={username}
          typingUsers={typingUsers}
          aiTyping={aiTyping}
        />

        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          room={currentRoom}
          disabled={!connected}
        />
      </div>
    </div>
  );
}
