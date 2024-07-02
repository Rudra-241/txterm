import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import socketClusterServer from "socketcluster-server";
import cookieParser from "cookie-parser";
import { restrictToLoggedinUserOnly, checkAuth } from "./middlewares/authentication.js";
import { router as registerRoute } from "./routes/register.js";
import { router as loginRoute } from "./routes/login.js";
import { router as chatRoute } from "./routes/chat.js";

const port = 3000;
const app = express();
const server = createServer(app);
const agServer = socketClusterServer.attach(server, { path: "/api/chat" });

const connectToDatabase = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/chat-app");
    console.log("MongoDB connected");
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
  }
};

//TOO MUCH REFACTORING AND ERROR HANDLING NEEDED

const setupMiddlewares = () => {
  app.use(cookieParser());
  app.use("/api/register", registerRoute);
  app.use("/api/login", loginRoute);
  app.use("/api/chat", restrictToLoggedinUserOnly, chatRoute);
};

const handleSocketSubscription = async (middlewareStream) => {
  for await (let action of middlewareStream) {
    if (action.type === action.SUBSCRIBE) {
      const realUsername = (await checkAuth(action.data)).username;
      if (action.channel !== realUsername) {
        console.log(realUsername);
        action.block("Unauthorized");
        action.socket.disconnect(3201, "Bad User");
      } else {
        action.allow();
      }
    } else {
      action.allow();
    }
  }
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
      console.log("Socket authenticated", user);

      handlePrivateMessages(socket, user);
    }
  }
};

const handlePrivateMessages = async (socket, user) => {
  for await (let data of socket.receiver("private message", { waitForAuth: true })) {
    if (!user) {
      socket.disconnect(3200, "Unauthorized");
    }
    socket.exchange.transmitPublish(data.to, {
      msg: data,
      from: user.username,
    });
    console.log(data, socket.id);
  }
};

const handleSocketConnection = async () => {
  for await (let { socket } of agServer.listener("connection")) {
    handleAuth(socket);

    agServer
      .listener("disconnection")
      .once()
      .then((obj) => {
        console.log(obj.reason, socket.id);
      });
    console.log(`${socket.id} connected! ${socket.authState}`);
  }
};

const startServer = () => {
  server.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

const initializeApp = async () => {
  await connectToDatabase();
  setupMiddlewares();
  setupSocketMiddleware();
  handleSocketConnection();
  startServer();
};

initializeApp();

export { agServer };
