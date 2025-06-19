import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sequelize } from "./db.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import { WebSocketServer } from "ws";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 8080 });
app.set("wss", wss);

// Use routes for each entity
app.use("/products", productRoutes);
app.use("/category", categoryRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);
app.use("/orderItem", orderItemRoutes);
app.use("/review", reviewRoutes);
app.use("/videos", videoRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
