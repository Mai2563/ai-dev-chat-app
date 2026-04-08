#!/bin/bash
# Start backend server in background
node server/index.js &
SERVER_PID=$!

# Start frontend (Vite on port 5000)
cd client && npm run dev

# If frontend exits, kill backend
kill $SERVER_PID 2>/dev/null
