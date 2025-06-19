import { OrderItem } from "../models/OrderItem.js";

export const getOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findAll();
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.create(req.body);
    res.status(201).json(orderItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (orderItem) {
      await orderItem.update(req.body);
      res.json(orderItem);
    } else {
      res.status(404).json({ error: "OrderItem not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (orderItem) {
      await orderItem.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "OrderItem not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
