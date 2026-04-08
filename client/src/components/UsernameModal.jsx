import React, { useState } from 'react';

export default function UsernameModal({ onSubmit }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    onSubmit(name);
  };

  const adjectives = ['Async', 'Binary', 'Cache', 'Debug', 'Event', 'Fuzzy', 'Grep', 'Hash', 'Inode', 'JSON', 'Kernel', 'Lambda', 'Mutex', 'Ninja', 'OAuth'];
  const animals = ['Badger', 'Cobra', 'Dolphin', 'Eagle', 'Fox', 'Gecko', 'Hawk', 'Iguana', 'Jaguar', 'Koala', 'Lynx', 'Mamba', 'Narwhal', 'Osprey', 'Panda'];

  const generateName = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    setValue(`${adj}${animal}${num}`);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 32,
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⌨️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome to DevChat
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Real-time chat for developers, powered by AI.<br />
            Choose a username to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter your username..."
              maxLength={24}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 14,
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            type="button"
            onClick={generateName}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              marginBottom: 12,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            🎲 Generate random username
          </button>

          <button
            type="submit"
            disabled={!value.trim()}
            style={{
              width: '100%',
              padding: '10px',
              background: value.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: value.trim() ? '#fff' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Join Chat →
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--ai-color)' }}>Pro tip:</strong> Mention <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--ai-color)' }}>@devbot</code> in any message to get an AI-powered response!
        </div>
      </div>
    </div>
  );
}
