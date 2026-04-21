  const socket = io();

  socket.on("connect", () => {
    console.log("CONNECTED:", socket.id);
  });

  function sendMessage() {
    const username = document.getElementById("username").value.trim();
    const input = document.getElementById("message");
    const message = input.value.trim();

    if (!username || !message) {
      alert("กรุณากรอกชื่อและข้อความก่อนส่ง");
      return;
    }

    socket.emit("send_message", { user: username, message });
    input.value = "";
  }

  socket.on("receive_message", (data) => {
    console.log("Received:", data);
    const li = document.createElement("li");
    li.innerText = data.user + ": " + data.message;
    document.getElementById("messages").appendChild(li);
  });