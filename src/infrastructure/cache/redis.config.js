// src/infrastructure/cache/redis.config.js
const { createClient } = require("redis");
const logger = require("../../utils/logger");

const env = process.env.NODE_ENV;

let clientOptions;

if (env === "test") {
  clientOptions = {
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  };
} else {
  clientOptions = {
    socket: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    database: Number(process.env.REDIS_DB) || 0,
  };

  if (process.env.REDIS_PASSWORD) {
    clientOptions.password = process.env.REDIS_PASSWORD;
  }
}

const client = createClient(clientOptions);

client.on("connect", () => {
  logger.info(`Redis connected (${env.toUpperCase()})`);
});

client.on("error", (err) => {
  logger.error("Redis Client Error", {
    error: err.message,
    stack: err.stack,
  });
});

const connect = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    logger.error("Redis Connection Failed", {
      error: err.message,
      stack: err.stack,
    });
  }
};

const disconnect = async () => {
  try {
    if (client.isOpen) {
      await client.quit();
      logger.info("Redis connection closed");
    }
  } catch (err) {
    logger.error("Redis close failed", {
      error: err.message,
      stack: err.stack,
    });
  }
};

module.exports = { client, connect, disconnect };
