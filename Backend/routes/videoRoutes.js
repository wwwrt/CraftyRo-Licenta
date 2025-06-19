// routes/videoRoutes.js
import express from "express";
import {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";

const router = express.Router();

router.get("/", getVideos);
router.post("/", createVideo);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

export default router;
