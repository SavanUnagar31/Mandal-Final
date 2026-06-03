require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const helmet = require("helmet");
const sanitizeMiddleware = require("./src/api/v1/middlewares/sanitize.middleware");
const cors = require("cors");
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

app.use(helmet());
app.use(cors());
app.use(globalLimiter);
app.use(express.json());
app.use(sanitizeMiddleware);
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send({
    message: "Welcome to the API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

const v1Routes = require("./src/api/v1/routes");
app.use("/api/v1", v1Routes);

const v2Routes = require("./src/api/v2/routes");
app.use("/api/v2", v2Routes);

const { apiBaseUrl } = require("./src/config/environment.config");

const swaggerFile = fs.readFileSync("./docs/api-docs/swagger.yaml", "utf8");

const serverUrl = apiBaseUrl || "";

const swaggerDocument = YAML.parse(
  swaggerFile.replace("${SERVER_URL}", serverUrl)
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      logger.error(`Failed to start server: ${err.message}`);
    });
}

module.exports = app;
