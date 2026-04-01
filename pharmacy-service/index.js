require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const medicineRoutes = require('./routes/medicineRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

connectDB();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pharmacy Service API',
      version: '1.0.0',
      description: 'Pharmacy management service',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs-json', (req, res) => res.json(swaggerSpec));

app.use('/medicines', medicineRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'Pharmacy Service',
    status: 'running',
    port: PORT,
    swagger: `http://localhost:${PORT}/api-docs`,
  });
});

app.listen(PORT, () => {
  console.log(`Pharmacy Service running on http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
