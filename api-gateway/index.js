require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Service Registry from .env
const services = {
  patient:     process.env.PATIENT_SERVICE_URL     || 'http://localhost:3001',
  doctor:      process.env.DOCTOR_SERVICE_URL      || 'http://localhost:3002',
  appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  pharmacy:    process.env.PHARMACY_SERVICE_URL    || 'http://localhost:3004',
};

// Request Logger
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

const proxyWithDefaults = (target, pathRewrite) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite,
  proxyTimeout: 10000,
  timeout: 10000,
  onError: (err, req, res) => {
    console.error(`[GATEWAY] Proxy error for ${req.method} ${req.url}: ${err.message}`);
    res.status(502).json({
      message: 'Bad gateway - target service unavailable',
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  },
});

// Proxy Routes
app.use('/api/patients', proxyWithDefaults(services.patient, { '^/api/patients': '/patients' }));

app.use('/api/doctors', proxyWithDefaults(services.doctor, { '^/api/doctors': '/doctors' }));

app.use('/api/appointments', proxyWithDefaults(services.appointment, { '^/api/appointments': '/appointments' }));

app.use('/api/medicines', proxyWithDefaults(services.pharmacy, { '^/api/medicines': '/medicines' }));

// Swagger proxy via gateway
app.use('/docs/patients', proxyWithDefaults(services.patient, { '^/docs/patients': '/api-docs' }));
app.use('/docs/doctors', proxyWithDefaults(services.doctor, { '^/docs/doctors': '/api-docs' }));
app.use('/docs/appointments', proxyWithDefaults(services.appointment, { '^/docs/appointments': '/api-docs' }));

// Raw OpenAPI JSON proxy for multi-doc Swagger UI
app.use('/docs-json/patients', proxyWithDefaults(services.patient, { '^/docs-json/patients': '/api-docs-json' }));
app.use('/docs-json/doctors', proxyWithDefaults(services.doctor, { '^/docs-json/doctors': '/api-docs-json' }));
app.use('/docs-json/appointments', proxyWithDefaults(services.appointment, { '^/docs-json/appointments': '/api-docs-json' }));

const gatewaySwaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    urls: [
      { url: `http://localhost:${PORT}/docs-json/patients`, name: 'Patient Service API' },
      { url: `http://localhost:${PORT}/docs-json/doctors`, name: 'Doctor Service API' },
      { url: `http://localhost:${PORT}/docs-json/appointments`, name: 'Appointment Service API' },
    ],
  },
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, gatewaySwaggerOptions));

// Gateway Home
app.get('/', (req, res) => {
  res.json({
    service: 'Hospital API Gateway',
    version: '1.0.0',
    status: 'running',
    port: PORT,
    endpoints: {
      patients:     `http://localhost:${PORT}/api/patients`,
      doctors:      `http://localhost:${PORT}/api/doctors`,
      appointments: `http://localhost:${PORT}/api/appointments`,
      medicines:    `http://localhost:${PORT}/api/medicines`,
    },
    swaggerDocs: {
      allServices:  `http://localhost:${PORT}/docs`,
      patients:     `http://localhost:${PORT}/docs/patients`,
      doctors:      `http://localhost:${PORT}/docs/doctors`,
      appointments: `http://localhost:${PORT}/docs/appointments`,
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services,
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`Swagger UI (All Services): http://localhost:${PORT}/docs`);
});
