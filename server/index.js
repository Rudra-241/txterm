import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import { restrictToLoggedinUserOnly } from "./middlewares/authentication.js";
import { router as registerRoute } from "./routes/register.js";
import { router as loginRoute } from "./routes/login.js";
import { router as chatRoute } from "./routes/chat.js";

const port = 3000;
const app = express();
const server = createServer(app);


mongoose
  .connect("mongodb://127.0.0.1:27017/chat-app")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("error connecting to mongodb", err));
app.use(cookieParser());
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/chat", restrictToLoggedinUserOnly, chatRoute);


export { server };



server.listen(port, () => {
  console.log(`npm app listening on port ${port}`);
});


