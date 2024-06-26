import { server } from "../index.js";
import { Server } from "socket.io";
import { user } from "../models/user.js";

const onlineUsersAndtheirSocketIDs = new Map([]);
const createPrivateRoom = (req, res) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    onlineUsersAndtheirSocketIDs.set(socket.id, req.user.username);
    console.log(onlineUsersAndtheirSocketIDs);
    socket.on("chat message", (msg) => {
      io.emit(
        "PM" + onlineUsersAndtheirSocketIDs.get(socket.id),
        "You aren't authorized to send public messages"
      );
    });
    socket.on("private message", ({ message, to }) => {
      console.log("private message" + to);
      io.emit("PM" + to.trim(), {
        content: message,
        from: onlineUsersAndtheirSocketIDs.get(socket.id),
      });
    });
    socket.on("disconnect", () => {
      console.log("User disconected ");
      onlineUsersAndtheirSocketIDs.delete(socket.id);
      console.log(onlineUsersAndtheirSocketIDs);
    });
  });

  res.json({ message: "succesfully connected" });
};

const addNewFriend = async (req, res) => {
  const friendname = req.query.name;

  const friend = await user.findOne({ username: friendname });
  if (!friend) {
    return res.status(400).json({ error: `No user named ${friendname} found` });
  }
  const friends = (await user.findById(req.user._id)).friends;

  if (friends.includes(friend._id)) {
    return res.json({ message: "Already a friend" });
  }

  await user.findByIdAndUpdate(req.user._id, {
    $push: { friends: friend._id },
  });
  return res.json({ message: "success" });
};

export { createPrivateRoom, addNewFriend };
