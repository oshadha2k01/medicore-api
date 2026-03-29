require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

connectDB();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Doctor Service API',
      version: '1.0.0',
      description: 'Microservice for managing hospital doctors - IT4020 SLIIT',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/doctors', doctorRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'Doctor Service',
    status: 'running',
    port: PORT,
    swagger: `http://localhost:${PORT}/api-docs`,
  });
});

app.listen(PORT, () => {
  console.log(`Doctor Service running on http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
