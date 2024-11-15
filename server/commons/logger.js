const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const COLORS = {
  error: "\x1b[31m", // red
  warn: "\x1b[33m", // yellow
  info: "\x1b[36m", // cyan
  debug: "\x1b[90m", // gray
};
const RESET = "\x1b[0m";

// Override with LOG_LEVEL env var (error | warn | info | debug).
const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

const log = (level, ...args) => {
  if (LEVELS[level] > currentLevel) return;

  const timestamp = new Date().toISOString();
  const label = `${COLORS[level]}${level.toUpperCase()}${RESET}`;
  const prefix = `${timestamp} [${label}]`;

  if (level === "error") {
    console.error(prefix, ...args);
  } else if (level === "warn") {
    console.warn(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
};

const logger = {
  error: (...args) => log("error", ...args),
  warn: (...args) => log("warn", ...args),
  info: (...args) => log("info", ...args),
  debug: (...args) => log("debug", ...args),
};

export { logger };
