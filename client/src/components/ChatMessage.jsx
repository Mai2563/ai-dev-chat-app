import React from 'react'

function formatText(text) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const content = part.slice(3, -3)
      const newlineIdx = content.indexOf('\n')
      const lang = newlineIdx > -1 ? content.slice(0, newlineIdx) : ''
      const code = newlineIdx > -1 ? content.slice(newlineIdx + 1) : content
      return (
        <pre key={i} className="code-block mt-2">
          {lang && <div className="text-xs text-slate-500 mb-2 font-sans">{lang}</div>}
          <code>{code}</code>
        </pre>
      )
    } else if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function ChatMessage({ message, currentUser }) {
  const isOwn = message.username === currentUser
  const isAi = message.isAi

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  if (isAi) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
          🤖
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">AI Assistant</span>
            <span className="text-xs text-slate-500">{time}</span>
          </div>
          <div className="bg-slate-700 border border-slate-600 rounded-2xl rounded-tl-sm px-4 py-3 message-bubble">
            <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
              {formatText(message.text)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isOwn) {
    return (
      <div className="flex items-start gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {message.username[0].toUpperCase()}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs text-slate-500">{time}</span>
            <span className="text-xs font-semibold text-indigo-300">You</span>
          </div>
          <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-4 py-3 message-bubble">
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">
              {formatText(message.text)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {message.username[0].toUpperCase()}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-300">{message.username}</span>
          <span className="text-xs text-slate-500">{time}</span>
        </div>
        <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 message-bubble">
          <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
            {formatText(message.text)}
          </div>
        </div>
      </div>
    </div>
  )
}
