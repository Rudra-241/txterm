#!/usr/bin/env node
import {
  login,
  register,
  addNewFriend,
  addNewChannel,
  getAllPublicChannels,
} from "./api.js";
import { chat } from "./chat.js";
import { mainMenu, printWelcomeMessage } from "./menu.js";
import { registerExitHandlers, gracefulExit } from "./shutdown.js";
import chalk from "chalk";
import { program } from "commander";
import pkg from "enquirer";
import pkgJson from "./package.json" with { type: "json" };
const { prompt, Select } = pkg;

registerExitHandlers();

// Wrap a command action so any failure exits cleanly instead of surfacing as an
// unhandled rejection. A cancelled prompt (Ctrl+C) rejects with an empty value,
// which we treat as a normal "Goodbye" rather than an error.
const withErrorHandling =
  (action) =>
  async (...args) => {
    try {
      await action(...args);
    } catch (error) {
      const message = error?.message ?? error;
      if (!message) {
        gracefulExit(0, chalk.yellow("\nGoodbye!"));
      } else {
        gracefulExit(1, chalk.red(`Error: ${message}`));
      }
    }
  };

program
  .version(pkgJson.version)
  .description("A simple CLI texting app")
  .option(
    "-l, --login",
    "Login to txterm",
    withErrorHandling(async () => {
      const response = await prompt([
        {
          type: "input",
          name: "username",
          message: "What is your username?",
        },
        {
          type: "password",
          name: "password",
          message: "What is your password?",
        },
      ]);
      login(response.username, response.password);
    })
  )
  .option(
    "-r, --register",
    "Regsiter to txterm",
    withErrorHandling(async () => {
      const response = await prompt([
        {
          type: "input",
          name: "username",
          message: "What is your username?",
        },
        {
          type: "password",
          name: "password",
          message: "What is your password?",
        },
      ]);
      register(response.username, response.password);
    })
  )
  .option(
    "-c, --chat <recipient>",
    "private message someone",
    withErrorHandling(async (options) => {
      printWelcomeMessage();
      chat(options, "PM");
    })
  )
  .option(
    "-j, --join",
    "join a channel",
    withErrorHandling(async () => {
      printWelcomeMessage();
      const list = await getAllPublicChannels();
      if (!list) {
        throw new Error("Could not fetch channels. Is the server running?");
      }

      const select = new Select({
        name: "channel",
        message: "Select the channel you want to join",
        choices: list,
      });

      const answer = await select.run();
      chat(answer, "JC");
    })
  )
  .option(
    "-C, --create",
    "create a channel",
    withErrorHandling(async () => {
      const response = await prompt([
        {
          type: "input",
          name: "channelName",
          message: "Enter new channel name",
        },
        {
          type: "input",
          name: "description",
          message: "Enter channel description",
        },
      ]);
      addNewChannel(response.channelName, response.description);
    })
  )
  .option(
    "-a, --add <username>",
    "Add a new friend",
    withErrorHandling(async (options) => {
      addNewFriend(options);
    })
  );

// No flags → drop into the interactive menu; otherwise run the requested flag.
if (process.argv.slice(2).length === 0) {
  withErrorHandling(mainMenu)();
} else {
  program.parse(process.argv);
}
