import { WebSocket } from "ws";
const ws = new WebSocket("ws://localhost:8080");

ws.on("open", function open() {
  console.log("Connected to WebSocket server");
});

ws.on("message", function message(data) {
  console.log("Message from server:", data);
});
