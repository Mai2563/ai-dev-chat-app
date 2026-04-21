console.log("🔥 app.js loaded");
document.addEventListener("DOMContentLoaded", () => {

console.log("🔥 DOM READY");
  
  const socket = io(window.location.origin);
  let myId = null;
  
  socket.on("connect", () => {
    console.log("CONNECTED:", socket.id);
    myId = socket.id;
  });

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

    // ✅ แสดงข้อความตัวเองทันที (ไม่ต้องรอ server)
    addMessage({ user: username, message, senderId: myId });

    // ✅ แสดง AI กำลังพิมพ์
    addMessage({ user: "AI", message: "กำลังพิมพ์..." });

    socket.emit("send_message", { user: username, message, senderId: myId });
    input.value = "";
  }

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

    // 👉 เพิ่มชื่อด้านบน
    const name = document.createElement("div");
    name.classList.add("name");
    name.innerText = data.user;

    const text = document.createElement("div");
    text.innerText = data.message;

    if (data.senderId !== myId) {
      bubble.appendChild(name);
    }
    bubble.appendChild(text);

    msgDiv.appendChild(bubble);
    document.getElementById("messages").appendChild(msgDiv);

    // scroll ลงล่าง
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
  }

  socket.on("receive_message", (data) => {
    console.log("Received:", data);
    
    // ❗ ถ้าเป็นข้อความของตัวเอง → ไม่ต้อง render ซ้ำ
    if (data.senderId === myId) return;

    addMessage(data);
  });

});