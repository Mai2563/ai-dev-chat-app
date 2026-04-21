// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
console.log(process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// ─── Step 1: Create Express app ───────────────────────────────────────────────
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

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

  socket.on("send_message", async (data) => {
    console.log("📩 User:", data);
    
    // ✅ สร้าง message ใหม่ให้ครบ
    const userMsg = {
      user: data.user,
      message: data.message,
      senderId: data.senderId, // ⭐ สำคัญ
    };

    io.emit("receive_message", userMsg);

    try {
      console.log("🤖 Calling AI...");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful chat assistant." },
          { role: "user", content: data.message },
        ],
      });

      console.log("✅ AI responded");
      
      const reply = completion.choices[0].message.content;

      io.emit("receive_message", {
        user: "AI",
        message: reply,
        senderId: "AI", // ⭐ กันซ้ำ
      });

      io.emit("receive_message", aiMsg);

    } catch (err) {
      console.error("❌ AI ERROR:", err.message);

      // ✅ fallback
      const fallbackMsg = {
        user: "AI",
        message: "ตอนนี้ AI ยังไม่พร้อมใช้งาน (demo mode) 😅",
        senderId: "AI",
      };

      io.emit("receive_message", fallbackMsg);
    }
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
