import express from "express";
import {
  getOrderItem,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
} from "../controllers/orderItemController.js";

const router = express.Router();

router.get("/orderItem", getOrderItem);
router.post("/orderItem", createOrderItem);
router.put("/orderItem/:id", updateOrderItem);
router.delete("/orderItem/:id", deleteOrderItem);

export default router;
