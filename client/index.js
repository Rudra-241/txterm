import axios from "axios";
import { create } from "socketcluster-client";
import { writeFile, readFile } from "fs";
import { promises as fsPromises } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { jwtDecode } from "jwt-decode";
import chalk from "chalk";
import pkg from "enquirer";
const { prompt } = pkg;

const API_HOST_NAME = "127.0.0.1";
const API_PORT_NUMBER = 3000;
const API_BASE_URL = `http://${API_HOST_NAME}:${API_PORT_NUMBER}`;
const sessionIDFilePath = `${dirname(
  fileURLToPath(import.meta.url)
)}/sessionID.txt`;

const readSessionID = async () => {
  try {
    const sID = await fsPromises.readFile(sessionIDFilePath, "utf-8");
    return sID;
  } catch (error) {
    throw new Error("No previous session ID found");
  }
};

const getCurrentUser = async () => {
  const sID = await readSessionID();
  const username = jwtDecode(sID).username;
  return { sID, username };
};

const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/register`, null, {
      params: { username, password },
    });
    console.log("Registration successful:");
  } catch (error) {
    console.error("Error registering: user already exists");
  }
};

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login`, null, {
      params: { username, password },
    });
    const content = response.data.uid;

    writeFile(sessionIDFilePath, content, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Successfully generated session ID");
      }
    });
  } catch (error) {
    console.error(
      "Error logging in:",
      error.response ? error.response.data : error.message
    );
  }
};

const handleSocketError = async (socket, sID, username) => {
  for await (let { error } of socket.listener("error")) {
    console.error(error);
    socket.transmit("auth", { sessionID: sID });
    socket.unsubscribe(username);
    handleIncomingMessages(username, sID);
  }
};

const handleIncomingMessages = async (socket, username, sID) => {
  let incomingPvtMsgs = socket.subscribe(username, { data: sID });
  for await (let pvtMsg of incomingPvtMsgs) {
    console.log(pvtMsg);
  }
};

const handleSocketConnect = async (socket, sID, recipient) => {
  for await (let event of socket.listener("connect")) {
    socket.transmit("auth", { sessionID: sID });

    while (true) {
      let msg = await prompt({
        type: "input",
        name: "message",
        message: ">",
      });
      msg = msg.message;
      socket.transmit("private message", {
        message: msg,
        to: recipient,
      });
    }
  }
};

const chat = async (recipient) => {
  try {
    const { sID, username } = await getCurrentUser();

    try {
      let socket = create({
        hostname: API_HOST_NAME,
        port: API_PORT_NUMBER,
        path: "/api/chat",
      });

      handleSocketError(socket, sID, username);
      handleIncomingMessages(socket, username, sID);
      handleSocketConnect(socket, sID, recipient);
    } catch (axiosError) {
      console.log("User terminated the process or an error occurred");
      process.exit(0);
    }
  } catch (fsError) {
    console.log(fsError.message);
  }
};

const addNewFriend = async (username) => {
  try {
    const { sID } = await getCurrentUser();
    const response = await axios.post(
      `${API_BASE_URL}/api/chat/add?name=${username}`,
      {},
      {
        headers: { "X-sessionID": sID, "Content-Type": "application/json" },
      }
    );
    console.log(response.data.message);
  } catch (error) {
    console.error("Error adding new friend:", error.message);
  }
};

export { chat, login, register, addNewFriend };
