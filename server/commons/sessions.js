import { redis } from "./redis.js";

// Maps a socketID to the username currently using it. 
const socketKey = (socketID) => `socket:${socketID}`;

const setSocketUser = (socketID, username) =>
  redis.set(socketKey(socketID), username);

const getSocketUser = (socketID) => redis.get(socketKey(socketID));

const removeSocket = (socketID) => redis.del(socketKey(socketID));

export { setSocketUser, getSocketUser, removeSocket };
