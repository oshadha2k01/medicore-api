require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
const requestContext = require('./middleware/requestContext');
const { notFound, errorHandler } = require('./middleware/error');
const logger = require('./utils/logger');
const { metricsMiddleware, register } = require('./utils/metrics');
const { tracingMiddleware, initializeTracing } = require('./utils/tracing');
const { bulkheadMiddleware } = require('./utils/resilience');

// Initialize tracing
if (process.env.NODE_ENV !== 'test') {
  initializeTracing();
}

const app = express();
const PORT = process.env.PORT || 3003;
const GATEWAY_PORT = process.env.GATEWAY_PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(requestContext);
app.use(tracingMiddleware);
app.use(morgan(':method :url :status :response-time ms - :req[x-correlation-id]', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));
app.use(express.json());
app.use(metricsMiddleware);
app.use(bulkheadMiddleware(10));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
}));

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

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'appointment-service',
    status: 'healthy',
    uptime: process.uptime(),
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (req, res) => {
  try {
    const dbReady = mongoose.connection.readyState === 1;
    if (!dbReady) {
      return res.status(503).json({
        service: 'appointment-service',
        status: 'not-ready',
        dependencies: { mongodb: 'disconnected' },
        correlationId: req.correlationId,
        timestamp: new Date().toISOString(),
      });
    }

    await mongoose.connection.db.admin().ping();

    return res.status(200).json({
      service: 'appointment-service',
      status: 'ready',
      dependencies: { mongodb: 'connected' },
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      service: 'appointment-service',
      status: 'not-ready',
      dependencies: { mongodb: 'error' },
      message: error.message,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Appointment Service running on http://localhost:${PORT}`);
    console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
