require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 500),
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
});

app.use(morgan(':method :url :status :response-time ms - :req[x-correlation-id]'));

// Service Registry from .env
const services = {
  patient:     process.env.PATIENT_SERVICE_URL     || 'http://localhost:3001',
  doctor:      process.env.DOCTOR_SERVICE_URL      || 'http://localhost:3002',
  appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  pharmacy:    process.env.PHARMACY_SERVICE_URL    || 'http://localhost:3004',
};

const userDirectory = {
  admin: { password: process.env.ADMIN_PASSWORD || 'admin123', role: 'ADMIN' },
  staff: { password: process.env.STAFF_PASSWORD || 'staff123', role: 'STAFF' },
};

const authExclusions = ['/auth/token', '/health', '/ready', '/docs', '/docs-json', '/'];

const authenticate = (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Missing or invalid authorization header',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
};

const authorize = (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  if (req.method === 'GET') {
    return next();
  }

  if (req.method === 'POST' && req.path.startsWith('/api/appointments') && ['ADMIN', 'STAFF'].includes(req.user.role)) {
    return next();
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Insufficient permissions',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  return next();
};

app.post('/auth/token', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({
      message: 'username and password are required',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  const account = userDirectory[username];
  if (!account || account.password !== password) {
    return res.status(401).json({
      message: 'Invalid credentials',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  const token = jwt.sign({ sub: username, role: account.role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    issuer: 'medicore-api-gateway',
  });

  return res.status(200).json({
    token,
    role: account.role,
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  });
});

app.use((req, res, next) => {
  if (authExclusions.some((route) => req.path === route || req.path.startsWith(`${route}/`))) {
    return next();
  }

  return authenticate(req, res, next);
});

app.use(authorize);

const proxyWithDefaults = (target, pathRewrite) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite,
  proxyTimeout: 10000,
  timeout: 10000,
  onProxyReq: (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-role', req.user.role);
      proxyReq.setHeader('x-user-sub', req.user.sub);
    }

    proxyReq.setHeader('x-correlation-id', req.correlationId);
  },
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
app.use('/docs/pharmacy', proxyWithDefaults(services.pharmacy, { '^/docs/pharmacy': '/api-docs' }));

// Raw OpenAPI JSON proxy for multi-doc Swagger UI
app.use('/docs-json/patients', proxyWithDefaults(services.patient, { '^/docs-json/patients': '/api-docs-json' }));
app.use('/docs-json/doctors', proxyWithDefaults(services.doctor, { '^/docs-json/doctors': '/api-docs-json' }));
app.use('/docs-json/appointments', proxyWithDefaults(services.appointment, { '^/docs-json/appointments': '/api-docs-json' }));
app.use('/docs-json/pharmacy', proxyWithDefaults(services.pharmacy, { '^/docs-json/pharmacy': '/api-docs-json' }));

const gatewaySwaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    urls: [
      { url: `http://localhost:${PORT}/docs-json/patients`, name: 'Patient Service API' },
      { url: `http://localhost:${PORT}/docs-json/doctors`, name: 'Doctor Service API' },
      { url: `http://localhost:${PORT}/docs-json/appointments`, name: 'Appointment Service API' },
      { url: `http://localhost:${PORT}/docs-json/pharmacy`, name: 'Pharmacy Service API' },
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
      pharmacy:     `http://localhost:${PORT}/docs/pharmacy`,
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    gateway: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services,
  });
});

app.get('/ready', async (req, res) => {
  const checks = await Promise.allSettled(
    Object.entries(services).map(async ([name, baseUrl]) => {
      const response = await fetch(`${baseUrl}/ready`, {
        method: 'GET',
        headers: {
          'x-correlation-id': req.correlationId,
        },
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        return { name, status: 'not-ready', httpStatus: response.status };
      }

      return { name, status: 'ready', httpStatus: response.status };
    })
  );

  const details = checks.map((check, index) => {
    const serviceName = Object.keys(services)[index];

    if (check.status === 'fulfilled') {
      return check.value;
    }

    return {
      name: serviceName,
      status: 'not-ready',
      error: check.reason?.message || 'Unknown error',
    };
  });

  const hasErrors = details.some((detail) => detail.status !== 'ready');

  return res.status(hasErrors ? 503 : 200).json({
    gateway: hasErrors ? 'not-ready' : 'ready',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
    services: details,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
    console.log(`Swagger UI (All Services): http://localhost:${PORT}/docs`);
  });
}

module.exports = app;
