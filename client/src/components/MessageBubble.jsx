import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ position: 'relative', margin: '8px 0', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        background: '#0d1117',
        borderBottom: '1px solid var(--border)'
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            background: copied ? 'var(--success)' : 'var(--bg-hover)',
            color: copied ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s'
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '12px',
          background: '#0d1117',
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: 'var(--font-mono)'
        }}
        showLineNumbers={value.split('\n').length > 5}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ message, isOwnMessage }) {
  const isAI = message.isAI;
  const initials = message.user?.[0]?.toUpperCase() || '?';

  const avatarColor = isAI ? 'var(--ai-color)' : isOwnMessage ? 'var(--accent)' : 'var(--warning)';
  const avatarBg = isAI ? 'rgba(163,113,247,0.15)' : isOwnMessage ? 'var(--accent-subtle)' : 'rgba(210,153,34,0.15)';

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '6px 16px',
      transition: 'background 0.1s',
      background: isAI ? 'rgba(163,113,247,0.04)' : 'transparent',
      borderLeft: isAI ? '2px solid rgba(163,113,247,0.3)' : '2px solid transparent',
      marginLeft: isAI ? 0 : 0
    }}
      onMouseEnter={e => e.currentTarget.style.background = isAI ? 'rgba(163,113,247,0.07)' : 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = isAI ? 'rgba(163,113,247,0.04)' : 'transparent'}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: isAI ? 'var(--radius-sm)' : '50%',
        background: avatarBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isAI ? 16 : 13,
        fontWeight: 700,
        color: avatarColor,
        flexShrink: 0,
        marginTop: 2,
        border: `1px solid ${avatarColor}30`
      }}>
        {isAI ? '🤖' : initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontWeight: 600,
            fontSize: 14,
            color: avatarColor
          }}>
            {message.user}
          </span>
          {isAI && (
            <span style={{
              fontSize: 10,
              padding: '1px 5px',
              background: 'rgba(163,113,247,0.15)',
              color: 'var(--ai-color)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}>
              AI
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div style={{
          color: 'var(--text-primary)',
          fontSize: 14,
          lineHeight: 1.6,
          wordBreak: 'break-word'
        }}>
          {isAI ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const value = String(children).replace(/\n$/, '');
                  return !inline ? (
                    <CodeBlock language={match?.[1]} value={value} />
                  ) : (
                    <code style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      background: 'var(--bg-tertiary)',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent)'
                    }} {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p style={{ margin: '4px 0' }}>{children}</p>;
                },
                ul({ children }) {
                  return <ul style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ul>;
                },
                ol({ children }) {
                  return <ol style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ol>;
                },
                li({ children }) {
                  return <li style={{ margin: '2px 0' }}>{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote style={{
                      borderLeft: '3px solid var(--ai-color)',
                      paddingLeft: 10,
                      color: 'var(--text-secondary)',
                      margin: '6px 0'
                    }}>
                      {children}
                    </blockquote>
                  );
                }
              }}
            >
              {message.text}
            </ReactMarkdown>
          ) : (
            <span>{message.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
