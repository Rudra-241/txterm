import express from "express";
import { createPrivateRoom } from "../controllers/chat.js";
const router = express.Router();
router.post("/", createPrivateRoom);

export { router };
