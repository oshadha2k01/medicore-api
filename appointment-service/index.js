require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3003;
const GATEWAY_PORT = process.env.GATEWAY_PORT || 3000;

connectDB();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Appointment Service API',
      version: '1.0.0',
      description: 'Appointment management service',
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

app.use('/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'Appointment Service',
    status: 'running',
    port: PORT,
    swagger: `http://localhost:${PORT}/api-docs`,
  });
});

app.listen(PORT, () => {
  console.log(`Appointment Service running on http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
