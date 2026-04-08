import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

export default function MessageList({ messages, username, typingUsers, aiTyping }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers, aiTyping]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  const typingDisplay = [...typingUsers].filter(u => u !== username);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: 16,
        paddingBottom: 8
      }}
    >
      {messages.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60%',
          gap: 12,
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Start the conversation
          </div>
          <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>
            Be the first to say something! Type <code style={{
              background: 'var(--bg-tertiary)',
              padding: '1px 5px',
              borderRadius: 3,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ai-color)'
            }}>@devbot your question</code> to get an AI response.
          </div>
        </div>
      )}

      {messages.map((msg, i) => {
        const prevMsg = messages[i - 1];
        const showDateSeparator =
          !prevMsg ||
          new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

        return (
          <React.Fragment key={msg.id || i}>
            {showDateSeparator && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                color: 'var(--text-muted)',
                fontSize: 12
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span>{new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            )}
            <MessageBubble
              message={msg}
              isOwnMessage={msg.user === username}
            />
          </React.Fragment>
        );
      })}

      {(typingDisplay.length > 0 || aiTyping) && (
        <div style={{
          padding: '4px 16px 8px',
          fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <TypingDots />
          {aiTyping && !typingDisplay.length && (
            <span style={{ color: 'var(--ai-color)' }}>DevBot is thinking...</span>
          )}
          {aiTyping && typingDisplay.length > 0 && (
            <span>
              <span style={{ color: 'var(--ai-color)' }}>DevBot</span>
              {' and '}
              <span style={{ color: 'var(--accent)' }}>{typingDisplay.join(', ')}</span>
              {' are typing'}
            </span>
          )}
          {!aiTyping && typingDisplay.length === 1 && (
            <span><span style={{ color: 'var(--accent)' }}>{typingDisplay[0]}</span> is typing</span>
          )}
          {!aiTyping && typingDisplay.length > 1 && (
            <span><span style={{ color: 'var(--accent)' }}>{typingDisplay.join(', ')}</span> are typing</span>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--text-muted)',
            display: 'inline-block',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
