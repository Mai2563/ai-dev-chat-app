import React from 'react'

export default function Sidebar({ rooms, currentRoom, onRoomSelect, username, isConnected }) {
  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white">💬 AI Dev Chat</h1>
        <p className="text-xs text-slate-400 mt-0.5">Real-time dev collaboration</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Channels</p>
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => onRoomSelect(room)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition duration-150 mb-1 ${
                currentRoom === room
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              # {room}
            </button>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">AI Assistant</p>
          <div className="px-3 py-2 rounded-lg bg-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm">🤖</span>
              <span className="text-sm text-indigo-300 font-medium">AI Assistant</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Mention @ai to get coding help</p>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {username[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{username}</p>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className="text-xs text-slate-400">{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
