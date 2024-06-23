import { server } from "../index.js";
import { Server } from "socket.io";
const onlineUsersAndtheirSocketIDs = new Map([]);
const createPrivateRoom = (req, res) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    onlineUsersAndtheirSocketIDs.set(socket.id, req.user.username);
    console.log(onlineUsersAndtheirSocketIDs);
    socket.on("chat message", (msg) => {
      io.emit("PM"+onlineUsersAndtheirSocketIDs.get(socket.id), "You aren't authorized to send public messages");
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

function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue) return key;
  }
}

export { createPrivateRoom };
