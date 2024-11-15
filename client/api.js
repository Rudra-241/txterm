import axios from "axios";
import chalk from "chalk";
import { getApiBaseUrl, writeSessionID, getCurrentUser } from "./config.js";

const register = async (username, password) => {
  try {
    await axios.post(`${getApiBaseUrl()}/api/register`, null, {
      params: { username, password },
    });
    console.log(chalk.green("Registration successful. You can now log in."));
    return true;
  } catch (error) {
    console.error(chalk.red("Error registering: user already exists"));
    return false;
  }
};

const login = async (username, password) => {
  try {
    const response = await axios.post(`${getApiBaseUrl()}/api/login`, null, {
      params: { username, password },
    });
    await writeSessionID(response.data.uid);
    console.log(chalk.green("Successfully logged in."));
    return true;
  } catch (error) {
    console.error(
      chalk.red("Error logging in:"),
      error.response ? error.response.data : error.message
    );
    return false;
  }
};

const addNewFriend = async (username) => {
  try {
    const { sID } = await getCurrentUser();
    const response = await axios.post(
      `${getApiBaseUrl()}/api/chat/add?name=${username}`,
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

const getAllPublicChannels = async () => {
  try {
    const { sID } = await getCurrentUser();
    const response = await axios.get(`${getApiBaseUrl()}/api/channels/`, {
      headers: { "X-sessionID": sID, "Content-Type": "application/json" },
    });
    const channels = response.data.list.map((channel) => {
      const description = channel.description || "No description available";
      return {
        message:
          chalk.bold.yellow(channel.name) + ": " + chalk.dim(description),
        value: channel.name,
        name: channel.name,
      };
    });
    return channels;
  } catch (error) {
    console.error("Error fetching public channels:", error.message);
  }
};

const getFriends = async () => {
  try {
    const { sID } = await getCurrentUser();
    const response = await axios.get(`${getApiBaseUrl()}/api/chat/friends`, {
      headers: { "X-sessionID": sID, "Content-Type": "application/json" },
    });
    return response.data.list.map((friend) => friend.username);
  } catch (error) {
    console.error(chalk.red("Error fetching friends:"), error.message);
    return null;
  }
};

const addNewChannel = async (channelName, description) => {
  try {
    const { sID } = await getCurrentUser();
    const response = await axios.post(
      `${getApiBaseUrl()}/api/channels/add?name=${channelName}&desc=${description}`,
      {},
      {
        headers: { "X-sessionID": sID, "Content-Type": "application/json" },
      }
    );
    console.log(response.data.message);
  } catch (error) {
    console.error("Error adding new Channel:", error.message);
  }
};

export {
  register,
  login,
  addNewFriend,
  getAllPublicChannels,
  getFriends,
  addNewChannel,
};
