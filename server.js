require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const helmet = require("helmet");
const sanitizeMiddleware = require("./src/api/v1/middlewares/sanitize.middleware");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { globalLimiter } = require("./src/api/v1/middlewares/rateLimit.middleware");
const app = express();
const logger = require("./src/utils/logger");
const { connectDB } = require("./src/config/database.config");
const { connect } = require("./src/infrastructure/cache/redis.config");

(async () => {
  await connect();
})();

const errorHandler = require("./src/core/errorHandler");
require("./src/utils/cron");

const isProduction = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────
// Security Headers (Helmet — strict production config)
// ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: isProduction ? ["'self'"] : ["*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // allowed for swagger UI
      styleSrc: ["'self'", "'unsafe-inline'"], // needed for swagger UI
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  hsts: isProduction ? {
    maxAge: 31536000,          // 1 year
    includeSubDomains: true,
    preload: true,
  } : false,
  crossOriginOpenerPolicy: isProduction ? { policy: "same-origin" } : false,
  originAgentCluster: isProduction ? true : false,
  frameguard: { action: "deny" },
  noSniff: true,
  xssFilter: false,           // disabled — rely on CSP instead (per guide)
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Remove X-Powered-By header (information disclosure)
app.disable("x-powered-by");

// ─────────────────────────────────────────────
// CORS — whitelist based, no wildcard in production
// ─────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (native mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // In test/dev mode with no CORS_ORIGIN set, allow all
    if (process.env.NODE_ENV !== "production" && allowedOrigins.length === 0) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin '${origin}' not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
}));

// ─────────────────────────────────────────────
// Request Correlation ID (for distributed tracing)
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// ─────────────────────────────────────────────
// Global Rate Limiter & Body Parsing
// ─────────────────────────────────────────────
app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(sanitizeMiddleware);

// Request logger with correlation ID
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { requestId: req.requestId });
  next();
});

// ─────────────────────────────────────────────
// Health Check endpoint
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
const v1Routes = require("./src/api/v1/routes");
app.use("/api/v1", v1Routes);

const v2Routes = require("./src/api/v2/routes");
app.use("/api/v2", v2Routes);

// ─────────────────────────────────────────────
// Developer / Localhost Only Endpoints
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === "localhost") {
  app.get("/swagger-custom.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`
      window.addEventListener('load', () => {
        const checkInterval = setInterval(() => {
          // Target the servers block directly
          const serversDiv = document.querySelector('.swagger-ui .servers');
          if (serversDiv) {
            clearInterval(checkInterval);
            if (document.getElementById('clear-db-redis-btn')) return;

            const btn = document.createElement('button');
            btn.textContent = '🗑️ Clear DB & Redis';
            btn.id = 'clear-db-redis-btn';

            Object.assign(btn.style, {
              backgroundColor: '#d9534f',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              marginLeft: '16px',
              marginTop: '20px',
              height: '34px',
              verticalAlign: 'bottom',
              transition: 'background-color 0.2s',
            });

            btn.addEventListener('mouseenter', () => { btn.style.backgroundColor = '#c0392b'; });
            btn.addEventListener('mouseleave', () => { btn.style.backgroundColor = '#d9534f'; });

            btn.addEventListener('click', async () => {
              if (confirm('Are you sure you want to clear the database and Redis? This cannot be undone.')) {
                btn.disabled = true;
                btn.textContent = 'Clearing...';
                try {
                  const response = await fetch('/api/dev/clear-db-redis', { method: 'POST' });
                  const result = await response.json();
                  if (result.success) {
                    alert('Database and Redis cleared successfully!');
                    window.location.reload();
                  } else {
                    alert('Error: ' + result.message);
                  }
                } catch (err) {
                  alert('Request failed: ' + err.message);
                } finally {
                  btn.disabled = false;
                  btn.textContent = '🗑️ Clear DB & Redis';
                }
              }
            });

            // Insert button right after the servers div (as a sibling)
            serversDiv.insertAdjacentElement('afterend', btn);
          }
        }, 100);
      });
    `);
  });

  app.post("/api/dev/clear-db-redis", async (req, res, next) => {
    try {
      logger.info("Dev API: Request to clear DB and Redis received.");
      
      // 1. Re-sync Database (Force: true drops and recreates all tables)
      const { sequelize } = require("./src/config/database.config");
      require("./src/infrastructure/database/models");
      await sequelize.sync({ force: true });
      logger.info("Dev API: Database cleared and synced successfully.");

      // 2. Flush Redis DB
      const { client } = require("./src/infrastructure/cache/redis.config");
      if (client.isOpen) {
        await client.flushDb();
        logger.info("Dev API: Redis cache flushed successfully.");
      } else {
        logger.warn("Dev API: Redis client is not open, skipping flush.");
      }

      res.status(200).json({ success: true, message: "Database and Redis cleared successfully." });
    } catch (error) {
      logger.error("Dev API: Failed to clear DB/Redis", { error: error.message, stack: error.stack });
      res.status(500).json({ success: false, message: error.message });
    }
  });
}

// ─────────────────────────────────────────────
// Swagger Docs
// ─────────────────────────────────────────────
const { apiBaseUrl } = require("./src/config/environment.config");
const swaggerFile = fs.readFileSync("./docs/api-docs/swagger.yaml", "utf8");
const serverUrl = apiBaseUrl || "";
const swaggerDocument = YAML.parse(
  swaggerFile.replace("${SERVER_URL}", serverUrl)
);
const swaggerOptions = {};
if (process.env.NODE_ENV === "localhost") {
  swaggerOptions.customJs = "/swagger-custom.js";
}
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Server Startup & Graceful Shutdown
// ─────────────────────────────────────────────
let server;
let notificationWorker;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      // Initialize BullMQ Worker
      notificationWorker = require("./src/infrastructure/queue/worker");
      logger.info("BullMQ Notification Worker initialized");

      const PORT = process.env.PORT || 3000;
      server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      logger.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    });
}

// Graceful Shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed. No new connections accepted.");

      try {
        // Close DB connection
        const { sequelize } = require("./src/config/database.config");
        await sequelize.close();
        logger.info("Database connections closed.");
      } catch (e) {
        logger.error(`DB close error: ${e.message}`);
      }

      try {
        // Close Redis connection
        const { disconnect } = require("./src/infrastructure/cache/redis.config");
        await disconnect();
        logger.info("Redis connection closed.");
      } catch (e) {
        logger.error(`Redis close error: ${e.message}`);
      }

      try {
        // Close BullMQ Worker
        if (notificationWorker) {
          await notificationWorker.close();
          logger.info("BullMQ Notification Worker closed.");
        }
      } catch (e) {
        logger.error(`Worker close error: ${e.message}`);
      }

      try {
        // Close BullMQ Queue
        const { notificationQueue } = require("./src/infrastructure/queue/bull.config");
        await notificationQueue.close();
        logger.info("Notification queue closed.");
      } catch (e) {
        logger.error(`Queue close error: ${e.message}`);
      }

      logger.info("Graceful shutdown complete.");
      process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after 30s timeout.");
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection", { reason: String(reason) });
});

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception — shutting down", { error: err.message, stack: err.stack });
  gracefulShutdown("uncaughtException");
});

module.exports = app;
