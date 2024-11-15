import cfonts from "cfonts";
import chalk from "chalk";
import pkg from "enquirer";
import {
  login,
  register,
  addNewFriend,
  addNewChannel,
  getAllPublicChannels,
  getFriends,
} from "./api.js";
import { chat } from "./chat.js";
import { gracefulExit } from "./shutdown.js";
import {
  getConfig,
  saveConfig,
  isConfigured,
  isLoggedIn,
  clearSession,
  getCurrentUser,
  DEFAULT_HOST,
  DEFAULT_PORT,
} from "./config.js";

const { prompt, Select } = pkg;

const printWelcomeMessage = () => {
  cfonts.say("TxTerm", {
    font: "block",
    align: "center",
    colors: ["red", "#f80"],
    background: "transparent",
    letterSpacing: 1,
    lineHeight: 0.5,
    space: true,
    maxLength: "0",
    gradient: ["red", "#f80"],
    independentGradient: true,
    transitionGradient: true,
    rawMode: false,
    env: "node",
  });
};

const configureServer = async () => {
  const current = isConfigured()
    ? getConfig()
    : { host: DEFAULT_HOST, port: DEFAULT_PORT };

  const answers = await prompt([
    {
      type: "input",
      name: "host",
      message: "Server host",
      initial: String(current.host),
    },
    {
      type: "input",
      name: "port",
      message: "Server port",
      initial: String(current.port),
    },
  ]);

  const port = Number(answers.port);
  await saveConfig({
    host: answers.host.trim() || DEFAULT_HOST,
    port: Number.isFinite(port) && port > 0 ? port : DEFAULT_PORT,
  });
  console.log(chalk.green("✓ Configuration saved.\n"));
};

const credentialPrompt = () =>
  prompt([
    { type: "input", name: "username", message: "Username" },
    { type: "password", name: "password", message: "Password" },
  ]);

const loggedOutMenu = async () => {
  const { host, port } = getConfig();
  const action = await new Select({
    name: "action",
    message: `Not logged in, server ${host}:${port}. What would you like to do?`,
    choices: [
      { name: "login", message: "Login" },
      { name: "register", message: "Register" },
      { name: "configure", message: "Configure server" },
      { name: "exit", message: "Exit" },
    ],
  }).run();

  switch (action) {
    case "login": {
      const { username, password } = await credentialPrompt();
      const ok = await login(username, password);
      return ok ? loggedInMenu() : loggedOutMenu();
    }
    case "register": {
      const { username, password } = await credentialPrompt();
      await register(username, password);
      return loggedOutMenu();
    }
    case "configure":
      await configureServer();
      return loggedOutMenu();
    default:
      return gracefulExit(0, chalk.yellow("Goodbye!"));
  }
};

const loggedInMenu = async () => {
  const { username } = await getCurrentUser();
  const action = await new Select({
    name: "action",
    message: `Logged in as ${chalk.cyan(username)}. What would you like to do?`,
    choices: [
      { name: "pm", message: "Private message someone" },
      { name: "join", message: "Join a channel" },
      { name: "create", message: "Create a channel" },
      { name: "add", message: "Add a friend" },
      { name: "friends", message: "See friends" },
      { name: "configure", message: "Configure server" },
      { name: "logout", message: "Logout" },
      { name: "exit", message: "Exit" },
    ],
  }).run();

  switch (action) {
    case "pm": {
      const { recipient } = await prompt({
        type: "input",
        name: "recipient",
        message: "Who do you want to message?",
      });
      return chat(recipient, "PM");
    }
    case "join": {
      const list = await getAllPublicChannels();
      if (!list || list.length === 0) {
        console.log(chalk.red("No channels available to join.\n"));
        return loggedInMenu();
      }
      const channel = await new Select({
        name: "channel",
        message: "Select the channel you want to join",
        choices: list,
      }).run();
      return chat(channel, "JC");
    }
    case "create": {
      const ans = await prompt([
        { type: "input", name: "channelName", message: "Enter new channel name" },
        { type: "input", name: "description", message: "Enter channel description" },
      ]);
      await addNewChannel(ans.channelName, ans.description);
      return loggedInMenu();
    }
    case "add": {
      const { friend } = await prompt({
        type: "input",
        name: "friend",
        message: "Friend's username",
      });
      await addNewFriend(friend);
      return loggedInMenu();
    }
    case "friends": {
      const friends = await getFriends();
      if (!friends || friends.length === 0) {
        console.log(chalk.yellow("You have no friends yet. Add one!\n"));
        return loggedInMenu();
      }
      const choice = await new Select({
        name: "friend",
        message: "Your friends, pick one to message, or go back",
        choices: [...friends, { role: "separator" }, { name: "__back", message: "Back" }],
      }).run();
      if (choice === "__back") return loggedInMenu();
      return chat(choice, "PM");
    }
    case "configure":
      await configureServer();
      return loggedInMenu();
    case "logout":
      await clearSession();
      console.log(chalk.yellow("Logged out.\n"));
      return loggedOutMenu();
    default:
      return gracefulExit(0, chalk.yellow("Goodbye!"));
  }
};

const mainMenu = async () => {
  printWelcomeMessage();

  if (!isConfigured()) {
    console.log(
      chalk.yellow("Welcome! Let's set up your server connection.\n")
    );
    await configureServer();
  }

  return isLoggedIn() ? loggedInMenu() : loggedOutMenu();
};

export { mainMenu, printWelcomeMessage };
