const { trace, context } = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
});

const initializeTracing = () => {
  try {
    sdk.start();
    console.log('OpenTelemetry SDK initialized');
  } catch (err) {
    console.warn('OpenTelemetry initialization warning:', err.message);
  }
};

const tracer = trace.getTracer(
  process.env.SERVICE_NAME || 'doctor-service',
  process.env.SERVICE_VERSION || '1.0.0'
);

const tracingMiddleware = (req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`);

  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'http.target': req.path,
    'http.host': req.hostname,
    'http.scheme': req.protocol,
    'http.user_agent': req.get('user-agent'),
    'http.client_ip': req.ip,
    'correlation.id': req.correlationId,
  });

  const wrappedNext = () => {
    res.on('finish', () => {
      span.setAttributes({ 'http.status_code': res.statusCode });
      span.end();
    });
    next();
  };

  context.with(trace.setSpan(context.active(), span), wrappedNext);
};

module.exports = { initializeTracing, tracer, tracingMiddleware };
