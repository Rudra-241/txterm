import chalk from "chalk";

let activeSocket = null;
let exiting = false;

const setActiveSocket = (socket) => {
  activeSocket = socket;
};

const gracefulExit = (code = 0, message) => {
  if (exiting) return; // avoid re-entering from multiple signals/errors
  exiting = true;

  if (message) console.log(message);

  try {
    if (activeSocket) {
      activeSocket.disconnect();
    }
  } catch (error) {
    
  }

  process.exit(code);
};

const registerExitHandlers = () => {
  process.on("SIGINT", () => gracefulExit(0, chalk.yellow("\nGoodbye!")));
  process.on("SIGTERM", () => gracefulExit(0, chalk.yellow("\nGoodbye!")));
  process.on("uncaughtException", (error) =>
    gracefulExit(1, chalk.red(`\nUnexpected error: ${error.message}`))
  );
  process.on("unhandledRejection", (reason) =>
    gracefulExit(1, chalk.red(`\nUnexpected error: ${reason?.message ?? reason}`))
  );
};

export { setActiveSocket, gracefulExit, registerExitHandlers };
