import express from "express";
import {
  createPrivateRoom,
  addNewFriend,
  getFriends,
} from "../controllers/chat.js";
const router = express.Router();
router.post("/", createPrivateRoom);
router.post("/add", addNewFriend);
router.get("/friends", getFriends);

export { router };
