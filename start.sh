#!/bin/bash
# Start the backend server in background
cd /home/runner/workspace/server && node index.js &

# Wait for server to be ready
sleep 2

# Start the frontend
cd /home/runner/workspace/client && npm run dev
