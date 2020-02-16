const express = require('express');
const app = express();
const docrouter = express.Router();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');

docrouter.use('/api-docs', swaggerUi.serve);
docrouter.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = docrouter;