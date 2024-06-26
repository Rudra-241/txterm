import express from "express";
import { createPrivateRoom } from "../controllers/chat.js";
import { addNewFriend } from "../controllers/chat.js";
const router = express.Router();
router.post("/", createPrivateRoom);
router.post("/add", addNewFriend);

export { router };
