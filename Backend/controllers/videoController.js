// controllers/videoController.js
import { Video } from "../models/Video.js";

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.findAll();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVideo = async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (video) {
      await video.update(req.body);
      res.json(video);
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (video) {
      await video.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
