import mongoose from "mongoose";
import { user } from "./user.js";
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  readByReceiver: {
    type: Boolean,
    default: false,
  },
});

const message = mongoose.model("message", messageSchema);
export { message };
