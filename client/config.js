import os from "os";
import path from "path";
import { promises as fsPromises, readFileSync, existsSync } from "fs";
import { jwtDecode } from "jwt-decode";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;

const CONFIG_DIR = path.join(os.homedir(), ".txterm");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const sessionIDFilePath = path.join(CONFIG_DIR, "sessionID.txt");

let cachedConfig = null;

// Precedence: env vars > config.json > defaults.
const loadConfig = () => {
  let fileConfig = {};
  try {
    fileConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    fileConfig = {};
  }

  const port = Number(process.env.TXTERM_PORT ?? fileConfig.port ?? DEFAULT_PORT);
  cachedConfig = {
    host: process.env.TXTERM_HOST ?? fileConfig.host ?? DEFAULT_HOST,
    port: Number.isFinite(port) && port > 0 ? port : DEFAULT_PORT,
  };
  return cachedConfig;
};

const getConfig = () => cachedConfig ?? loadConfig();
const getApiHost = () => getConfig().host;
const getApiPort = () => getConfig().port;
const getApiBaseUrl = () => {
  const { host, port } = getConfig();
  return `http://${host}:${port}`;
};

const ensureConfigDir = async () => {
  await fsPromises.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  try {
    await fsPromises.chmod(CONFIG_DIR, 0o700);
  } catch {}
};

const saveConfig = async ({ host, port }) => {
  await ensureConfigDir();
  const data = { host, port: Number(port) };
  await fsPromises.writeFile(CONFIG_FILE, JSON.stringify(data, null, 2), {
    mode: 0o600,
  });
  try {
    await fsPromises.chmod(CONFIG_FILE, 0o600);
  } catch {}
  cachedConfig = { ...data };
  return cachedConfig;
};

const isConfigured = () => existsSync(CONFIG_FILE);

const writeSessionID = async (content) => {
  await ensureConfigDir();
  await fsPromises.writeFile(sessionIDFilePath, content, { mode: 0o600 });
  try {
    await fsPromises.chmod(sessionIDFilePath, 0o600);
  } catch {}
};

const readSessionID = async () => {
  try {
    return await fsPromises.readFile(sessionIDFilePath, "utf-8");
  } catch {
    throw new Error("No previous session ID found. Please login first.");
  }
};

const isLoggedIn = () => {
  try {
    const sID = readFileSync(sessionIDFilePath, "utf-8").trim();
    if (!sID) return false;
    jwtDecode(sID); 
    return true;
  } catch {
    return false;
  }
};

const clearSession = async () => {
  try {
    await fsPromises.unlink(sessionIDFilePath);
  } catch {}
};

const getCurrentUser = async () => {
  const sID = (await readSessionID()).trim();
  const username = jwtDecode(sID).username;
  return { sID, username };
};

export {
  CONFIG_DIR,
  CONFIG_FILE,
  sessionIDFilePath,
  DEFAULT_HOST,
  DEFAULT_PORT,
  loadConfig,
  getConfig,
  getApiHost,
  getApiPort,
  getApiBaseUrl,
  saveConfig,
  isConfigured,
  readSessionID,
  writeSessionID,
  isLoggedIn,
  clearSession,
  getCurrentUser,
};
