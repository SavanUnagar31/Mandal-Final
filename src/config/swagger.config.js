const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');

const swaggerDocument = YAML.parse(fs.readFileSync('./docs/api-docs/swagger.yaml', 'utf8'));

module.exports = {
  swaggerUi,
  swaggerDocument,
};