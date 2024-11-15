import { create } from "socketcluster-client";
import chalk from "chalk";
import pkg from "enquirer";
import { getConfig, getCurrentUser } from "./config.js";
import { setActiveSocket, gracefulExit } from "./shutdown.js";

const { prompt } = pkg;

const promptMessage = async () => {
  try {
    const { message } = await prompt({
      type: "input",
      name: "message",
      message: ">",
    });
    return message;
  } catch (error) {
    gracefulExit(0, chalk.yellow("\nGoodbye!"));
  }
};

const handleSocketError = async (socket) => {
  for await (let { error } of socket.listener("error")) {
    // Idle sockets get dropped with a 1006 abnormal close ("Socket hung up").
    // socketcluster-client reconnects and re-subscribes automatically, so this
    // is transient — show a concise note instead of dumping the raw stack.
    console.error(
      chalk.yellow(`Connection issue: ${error.message} (reconnecting…)`)
    );
  }
};

// pvtMsg doesn't necessarily mean PMs, changes required
const handleIncomingMessages = async (socket, username, sID) => {
  let incomingPvtMsgs = socket.subscribe(username, {
    data: { type: "self", sessionID: sID },
  });
  for await (let pvtMsg of incomingPvtMsgs) {
    console.log(
      chalk.green.bold(`${pvtMsg.from}: `) +
        chalk.magenta(`${pvtMsg.msg.message} `)
    );
  }
};

const handleIncomingChannelMessages = async (socket, channelName, sID, myName) => {
  let incomingMsgs = socket.subscribe(channelName, {
    data: { type: "channel", sessionID: sID },
  });
  for await (let Msg of incomingMsgs) {
    if (Msg.from !== myName) {
      console.log(
        chalk.green.bold(`${Msg.from}: `) + chalk.magenta(`${Msg.msg.message} `)
      );
    }
  }
};

// Re-authenticate on every (re)connect. Kept separate from the input loop so
// reconnects after a dropped socket still re-send auth.
const handleSocketConnect = async (socket, sID) => {
  for await (let event of socket.listener("connect")) {
    socket.transmit("auth", { sessionID: sID });
  }
};

const promptLoop = async (socket, eventName, to) => {
  while (true) {
    const msg = await promptMessage();
    socket.transmit(eventName, { message: msg, to });
  }
};

// recipient can also be a channel when type === "JC"
const chat = async (recipient, type) => {
  try {
    const { sID, username } = await getCurrentUser();
    const { host, port } = getConfig();

    try {
      let socket = create({
        hostname: host,
        port: port,
        path: "/api/chat",
      });
      setActiveSocket(socket);

      handleSocketError(socket);
      handleSocketConnect(socket, sID);

      if (type === "PM") {
        handleIncomingMessages(socket, username, sID);
        promptLoop(socket, "private message", recipient);
      }
      if (type === "JC") {
        handleIncomingChannelMessages(socket, recipient, sID, username);
        promptLoop(socket, "channel message", recipient);
      }
    } catch (axiosError) {
      console.log("User terminated the process or an error occurred");
      process.exit(0);
    }
  } catch (fsError) {
    console.log(fsError.message);
  }
};

export { chat };
