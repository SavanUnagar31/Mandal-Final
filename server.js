require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const app = express();
const logger = require("./src/utils/logger");
const { connectDB } = require("./src/config/database.config");
const { connect } = require("./src/infrastructure/cache/redis.config");
(async () => {
  await connect();
})();

const errorHandler = require("./src/core/errorHandler");
require("./src/utils/cron");

app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

const v1Routes = require("./src/api/v1/routes");
app.use("/api/v1", v1Routes);

const v2Routes = require("./src/api/v2/routes");
app.use("/api/v2", v2Routes);

const swaggerFile = fs.readFileSync("./docs/api-docs/swagger.yaml", "utf8");

const serverUrl =
  process.env.NODE_ENV === "development"
    ? process.env.API_BASE_URL || "https://mandal.growshadow.com"
    : process.env.API_BASE_URL || "http://localhost:3000";

const swaggerDocument = YAML.parse(
  swaggerFile.replace("${SERVER_URL}", serverUrl)
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    logger.error(`Failed to start server: ${err.message}`);
  });
