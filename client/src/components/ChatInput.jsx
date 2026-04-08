import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, onTyping, onStopTyping, room, disabled }) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 1500);

    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    clearTimeout(typingTimerRef.current);
    setIsTyping(false);
    onStopTyping?.();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, [room]);

  const hasText = text.trim().length > 0;
  const mentionsAI = text.toLowerCase().includes('@devbot') || text.toLowerCase().includes('@ai') || text.toLowerCase().startsWith('/ai ');

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {mentionsAI && (
        <div style={{
          fontSize: 12,
          color: 'var(--ai-color)',
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <span>🤖</span>
          <span>DevBot will respond to your message</span>
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        transition: 'border-color 0.2s',
        borderColor: mentionsAI ? 'var(--ai-color)' : 'var(--border)'
      }}
        onFocus={e => {
          if (!mentionsAI) e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = mentionsAI ? 'var(--ai-color)' : 'var(--border)';
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${room} — type @devbot or @ai to ask the AI`}
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 14,
            resize: 'none',
            lineHeight: 1.5,
            maxHeight: 120,
            fontFamily: 'var(--font-sans)',
            caretColor: 'var(--accent)'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!hasText || disabled}
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: hasText && !disabled ? 'var(--accent)' : 'var(--bg-hover)',
            color: hasText && !disabled ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
            fontSize: 14
          }}
          title="Send message (Enter)"
        >
          ↑
        </button>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4,
        fontSize: 11,
        color: 'var(--text-muted)'
      }}>
        <span>Shift+Enter for newline</span>
        <span>Use <code style={{ background: 'var(--bg-tertiary)', padding: '0 3px', borderRadius: 2, fontFamily: 'var(--font-mono)' }}>@devbot</code> for AI responses</span>
      </div>
    </div>
  );
}
