import { createClient } from "redis";
import { logger } from "./logger.js";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redis.on("error", (err) => logger.error("Redis error", err));

const connectToRedis = async () => {
  try {
    await redis.connect();
    logger.info("Redis connected");
  } catch (err) {
    logger.error("Error connecting to Redis", err);
  }
};

export { redis, connectToRedis };
