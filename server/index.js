import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import "dotenv/config";
import socketClusterServer from "socketcluster-server";
import {
  restrictToLoggedinUserOnly,
  checkAuth,
} from "./middlewares/authentication.js";
import { handleSocketSubscription } from "./middlewares/socketSubscription.js";
import { connectToRedis } from "./commons/redis.js";
import { removeSocket } from "./commons/sessions.js";
import { logger } from "./commons/logger.js";
import { router as registerRoute } from "./routes/register.js";
import { router as loginRoute } from "./routes/login.js";
import { router as chatRoute } from "./routes/chat.js";
import { router as channelRoute } from "./routes/channels.js";

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const agServer = socketClusterServer.attach(server, { path: "/api/chat" });

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat-app");
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("Error connecting to MongoDB", err);
  }
};

//TOO MUCH REFACTORING AND ERROR HANDLING NEEDED

const setupMiddlewares = () => {
  app.use("/api/register", registerRoute);
  app.use("/api/login", loginRoute);
  app.use("/api/chat", restrictToLoggedinUserOnly, chatRoute);
  app.use("/api/channels", restrictToLoggedinUserOnly, channelRoute);
};

const setupSocketMiddleware = () => {
  agServer.setMiddleware(agServer.MIDDLEWARE_INBOUND, handleSocketSubscription);
};

const handleAuth = async (socket) => {
  for await (let data of socket.receiver("auth")) {
    const user = await checkAuth(data.sessionID);
    if (!user) {
      socket.disconnect(3200, "Unauthorized");
    } else {
      socket.authState = socket.AUTHENTICATED;
      logger.info("Socket authenticated", user.username);
      handleChannelMessages(socket, user);
      handlePrivateMessages(socket, user);
    }
  }
};

const handlePrivateMessages = async (socket, user) => {
  for await (let data of socket.receiver("private message", {
    waitForAuth: true,
  })) {
    if (!user) {
      socket.disconnect(3200, "Unauthorized");
    }
    socket.exchange.transmitPublish(data.to, {
      msg: data,
      from: user.username,
    });
  }
};

const handleChannelMessages = async (socket, user) => {
  for await (let data of socket.receiver("channel message", {
    waitForAuth: true,
  })) {
    if (!user) {
      socket.disconnect(3200, "Unauthorized");
    }
    socket.exchange.transmitPublish(data.to, {
      msg: data,
      from: user.username,
    });
  }
};

const handleSocketConnection = async () => {
  for await (let { socket } of agServer.listener("connection")) {
    handleAuth(socket);

    agServer
      .listener("disconnection")
      .once()
      .then(async (obj) => {
        await removeSocket(obj.socket.id);
        logger.debug("Socket disconnected", socket.id, obj.reason);
      });
    logger.debug("Socket connected", socket.id, socket.authState);
  }
};

const startServer = () => {
  server.listen(port, () => {
    logger.info(`App listening on port ${port}`);
  });
};

const initializeApp = async () => {
  await connectToDatabase();
  await connectToRedis();
  setupMiddlewares();
  setupSocketMiddleware();
  handleSocketConnection();
  startServer();
};

initializeApp();

export { agServer };
