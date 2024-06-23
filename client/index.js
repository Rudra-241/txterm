import axios from "axios";
import { writeFile, readFile } from "fs";
import { promises as fsPromises } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import chalk from 'chalk';
import pkg from "enquirer";
const { prompt } = pkg;
const API_BASE_URL = "http://localhost:3000";

const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/register`, null, {
      params: {
        username,
        password,
      },
    });
    console.log("Registration successful:");
  } catch (error) {
    console.error("Error registering: user already exists");
  }
};

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login`, null, {
      params: {
        username,
        password,
      },
    });
    const content = response.data.uid;
    const sessionIDFilePath = `${dirname(
      fileURLToPath(import.meta.url)
    )}/sessionID.txt`;
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
const chat = async (recipient) => {
  const sessionIDFilePath = `${dirname(
    fileURLToPath(import.meta.url)
  )}/sessionID.txt`;

  try {
    const sID = await fsPromises.readFile(sessionIDFilePath, "utf-8");
    const username = jwtDecode(sID).username;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat`,
        {},
        {
          headers: { "X-sessionID": sID, "Content-Type": "application/json" },
        }
      );
      const socket = io(API_BASE_URL);
      console.log("private message" + username);
      // vulnerable: one can modify the username and receive someone else's messages 
      socket.on("PM" + username.trim(), ({ content, from }) => {
        console.log(chalk.green.dim.bold(`[${from}]: `)+chalk.yellow(`${content}`));
      });
      socket.on("chat message", ({ content, to, from }) => {
        console.log(`${from}:${to} :${content}`);
      });

      while (true) {
        let msg = await prompt({
          type: "input",
          name: "message",
          message: ">",
        });
        msg = msg.message;
        socket.emit("private message", {
          message: msg,
          to: recipient,
        });
      }

    } catch (axiosError) {
      console.log("User terminated the process or an error occured")
      process.exit(0);
    }
  } catch (fsError) {
    console.log("No previous session ID found");
  }
};

export { chat, login, register };
