console.log("🔥 app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 DOM READY");

  const socket = io(window.location.origin);
  let myId = null;

  // ─── CONNECT ─────────────────
  socket.on("connect", () => {
    console.log("CONNECTED:", socket.id);
    myId = socket.id;
  });

  // ─── CLICK SEND ──────────────
  document.getElementById("sendBtn").addEventListener("click", sendMessage);

  function sendMessage() {
    console.log("🚀 CLICK SEND");

    const username = document.getElementById("username").value.trim();
    const input = document.getElementById("message");
    const message = input.value.trim();

    if (!username || !message) {
      alert("กรุณากรอกชื่อและข้อความก่อนส่ง");
      return;
    }

    // ✅ แสดงข้อความตัวเองทันที
    addMessage({
      user: username,
      message,
      senderId: myId,
    });

    // ✅ แสดง typing (delay นิดให้เนียน)
    setTimeout(() => {
      showTyping();
    }, 300);

    // ✅ ส่งไป server
    socket.emit("send_message", {
      user: username,
      message,
      senderId: myId,
    });

    input.value = "";
  }

  // ─── ADD MESSAGE ─────────────
  function addMessage(data) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    // 👉 แยกฝั่ง
    if (data.senderId === myId) {
      msgDiv.classList.add("user"); // ขวา
    } else {
      msgDiv.classList.add("other"); // ซ้าย
    }

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    // 👉 ชื่อ
    const name = document.createElement("div");
    name.classList.add("name");
    name.innerText = data.user;

    const text = document.createElement("div");
    text.innerText = data.message;

    // 👉 ฝั่งอื่นมีชื่อ ฝั่งตัวเองไม่ต้องมี
    if (data.senderId !== myId) {
      bubble.appendChild(name);
    }

    bubble.appendChild(text);
    msgDiv.appendChild(bubble);

    document.getElementById("messages").appendChild(msgDiv);

    scrollToBottom();
  }

  // ─── TYPING ──────────────────
  function showTyping() {
    removeTyping(); // กันซ้ำ

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", "other");
    msgDiv.id = "typing";

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.innerText = "กำลังพิมพ์...";

    msgDiv.appendChild(bubble);
    document.getElementById("messages").appendChild(msgDiv);

    scrollToBottom();
  }

  function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
  }

  // ─── RECEIVE MESSAGE ─────────
  socket.on("receive_message", (data) => {
    console.log("Received:", data);

    // ✅ ถ้าเป็น AI → ลบ typing ก่อน
    if (data.user === "AI") {
      removeTyping();
    }

    // ❗ กันข้อความตัวเองซ้ำ
    if (data.senderId === myId) return;

    addMessage(data);
  });

  // ─── SCROLL ─────────────────
  function scrollToBottom() {
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
  }
});