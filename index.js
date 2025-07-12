require('dotenv').config(); // 👈 This should be at the very top
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 8000;


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const subscriptions = new Map(); // socket.id => boolean (true = subscribed)
const symbols = ["RELIANCE", "TCS", "HDFCBANK"];
const getRandomPrice = () => {
  const sign = Math.random() < 0.5 ? -1 : 1; // 50% chance for negative
  return (sign * (Math.random() * 1000 + 100)).toFixed(2);
};

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // By default: auto-subscribe when connected (or set to false if you prefer)
  subscriptions.set(socket.id, true);

  socket.on("subscribe:sidebar", () => {
    subscriptions.set(socket.id, true);
    console.log(`✅ ${socket.id} subscribed`);
  });

  socket.on("unsubscribe:sidebar", () => {
    subscriptions.set(socket.id, false);
    console.log(`❌ ${socket.id} unsubscribed`);
  });

  socket.on("disconnect", () => {
    subscriptions.delete(socket.id);
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Emit mock market data every 1 second
setInterval(() => {
  const data = symbols.map((s) => ({
    symbol: s,
    price: getRandomPrice(),
    time: new Date().toLocaleTimeString(),
  }));

  // Send only to subscribed clients
  for (const [socketId, isSubscribed] of subscriptions.entries()) {
    if (isSubscribed) {
      price_sideBar= getRandomPrice(),
      io.to(socketId).emit("sidebar",price_sideBar)
    }
    io.to(socketId).emit("market:data", data);
  }
  
}, 1000);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
