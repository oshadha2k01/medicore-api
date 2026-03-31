require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const GATEWAY_PORT = process.env.GATEWAY_PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Patient Service API',
      version: '1.0.0',
      description: 'Patient management service',
    },
    servers: [
      { url: `http://localhost:${GATEWAY_PORT}/api`, description: 'Via API Gateway' },
      { url: `http://localhost:${PORT}`, description: 'Direct Service Access' },
    ],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs-json', (req, res) => res.json(swaggerSpec));

// Routes
app.use('/patients', patientRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Patient Service',
    status: 'running',
    port: PORT,
    swagger: `http://localhost:${PORT}/api-docs`,
  });
});

app.listen(PORT, () => {
  console.log(`Patient Service running on http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
