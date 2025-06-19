import { Reviews } from "../models/Reviews.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findAll();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReviews = async (req, res) => {
  try {
    const reviews = await Reviews.create(req.body);
    res.status(201).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findByPk(req.params.id);
    if (reviews) {
      await reviews.update(req.body);
      res.json(reviews);
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findByPk(req.params.id);
    if (reviews) {
      await reviews.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
