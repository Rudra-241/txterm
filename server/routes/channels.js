import express from "express";
import {
  getAllPublicChannels,
  addNewChannel,
} from "../controllers/channels.js";

const router = express.Router();
router.get("/", getAllPublicChannels);
router.post("/add", addNewChannel);

export { router };
