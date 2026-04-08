import React from 'react';

const ROOMS = [
  { id: 'general', name: 'general', emoji: '💬' },
  { id: 'javascript', name: 'javascript', emoji: '🟨' },
  { id: 'python', name: 'python', emoji: '🐍' },
  { id: 'devops', name: 'devops', emoji: '⚙️' },
  { id: 'ai-ml', name: 'ai-ml', emoji: '🤖' }
];

export default function Sidebar({ currentRoom, onRoomChange, users, connected, username }) {
  return (
    <div style={{
      width: 220,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      <div style={{
        padding: '16px 12px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ fontSize: 20 }}>⌨️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>DevChat</div>
          <div style={{ fontSize: 11, color: connected ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: connected ? 'var(--success)' : 'var(--danger)'
            }} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
        <div style={{
          padding: '0 12px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          Channels
        </div>
        {ROOMS.map(room => (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id)}
            style={{
              width: '100%',
              padding: '6px 12px',
              background: currentRoom === room.id ? 'var(--bg-hover)' : 'transparent',
              color: currentRoom === room.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              borderRadius: 0,
              transition: 'background 0.1s, color 0.1s',
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              fontWeight: currentRoom === room.id ? 600 : 400
            }}
            onMouseEnter={e => {
              if (currentRoom !== room.id) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (currentRoom !== room.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ fontSize: 13, opacity: 0.7 }}>#</span>
            <span>{room.name}</span>
          </button>
        ))}
      </div>

      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '10px 12px'
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8
        }}>
          Online — {users.length}
        </div>
        {users.slice(0, 8).map((u, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '3px 0',
            fontSize: 13,
            color: u === username ? 'var(--accent)' : 'var(--text-secondary)'
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--success)',
              flexShrink: 0
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u}{u === username ? ' (you)' : ''}
            </span>
          </div>
        ))}
        {users.length > 8 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            +{users.length - 8} more
          </div>
        )}
      </div>

      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--accent)',
            flexShrink: 0
          }}>
            {username?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {username || 'Anonymous'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Developer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
