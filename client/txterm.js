#!/usr/bin/env node
import { login, register, chat } from "./index.js";
import { program } from "commander";
import pkg from "enquirer";
const { prompt } = pkg;

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
  .option("-c, --chat <type>", "Start chatting", async (options) => {
    chat(options);
  });

program.parse(process.argv);
