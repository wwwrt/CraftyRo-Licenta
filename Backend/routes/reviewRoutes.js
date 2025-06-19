import express from "express";
import {
  getReviews,
  createReviews,
  updateReviews,
  deleteReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/reviews", getReviews);
router.post("/reviews", createReviews);
router.put("/reviews/:id", updateReviews);
router.delete("/reviews/:id", deleteReviews);

export default router;
