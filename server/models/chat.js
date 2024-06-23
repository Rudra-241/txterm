import mongoose from "mongoose";
import { message } from "./message.js";

const chatSchema = new mongoose.Schema({
  chatters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:message,
      required: true,
    },
  ],
});

const chat = mongoose.model("chat",chatSchema);

export { chat };