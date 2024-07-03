#!/usr/bin/env node
import { login, register, chat, addNewFriend, addNewChannel } from "./index.js";
import cfonts from "cfonts";
import { program } from "commander";
import pkg from "enquirer";
const { prompt } = pkg;

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

program
  .version("1.0.0")
  .description("A simple CLI texting app")
  .option("-l, --login", "Login to txterm", async () => {
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
  .option("-r, --register", "Regsiter to txterm", async () => {
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
  .option(
    "-c, --chat <recipient>",
    "private message someone",
    async (options) => {
      printWelcomeMessage();
      chat(options, "PM");
    }
  )
  .option("-j, --join <channel>", "join a channel", async (options) => {
    printWelcomeMessage();
    chat(options, "JC");
  })
  .option("-C, --create <recipient>", "create a channel", async (options) => {
    addNewChannel(options);
  })
  .option("-a, --add <username>", "Add a new friend", async (options) => {
    addNewFriend(options);
  });

program.parse(process.argv);
