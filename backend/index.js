// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// ─── Step 1: Create Express app ───────────────────────────────────────────────
const app = express();
app.use(express.static(__dirname));

// Optional: a simple HTTP route so you can verify the server is up
// app.get("/", (req, res) => {
//   res.send("Socket.io server is running 🚀");
// });

// ─── Step 2: Wrap Express in a native HTTP server ─────────────────────────────
// Socket.io needs direct access to the HTTP server, not just the Express app.
const httpServer = http.createServer(app);

// ─── Step 3: Attach Socket.io to the HTTP server ─────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins — tighten this in production
  },
});

// ─── Step 4: Listen for Socket.io events ─────────────────────────────────────
io.on("connection", (socket) => {
  // Fires each time a new client connects
  console.log(`✅ User connected    — socket id: ${socket.id}`);

  socket.on("send_message", (data) => {
    console.log("Message:", data);
    io.emit("receive_message", data);
  });

  // Fires when this specific client disconnects
  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected — socket id: ${socket.id} | reason: ${reason}`);
  });
});

// ─── Step 5: Start the server ─────────────────────────────────────────────────
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🟢 Server listening on http://localhost:${PORT}`);
});
