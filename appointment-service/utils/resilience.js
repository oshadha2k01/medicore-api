const CircuitBreaker = require('opossum');
const retry = require('p-retry');

const createCircuitBreaker = (fn, options = {}) => {
  const breaker = new CircuitBreaker(fn, {
    timeout: options.timeout || 5000,
    errorThresholdPercentage: options.errorThreshold || 50,
    resetTimeout: options.resetTimeout || 30000,
    name: options.name || 'default-breaker',
    ...options,
  });

  return breaker;
};

const withRetry = async (fn, options = {}) => {
  return retry(fn, {
    retries: options.retries || 3,
    minTimeout: options.minTimeout || 100,
    maxTimeout: options.maxTimeout || 2000,
    factor: options.factor || 2,
  });
};

const retryMiddleware = (maxRetries = 3) => (fn) => {
  return async (...args) => {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 100;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };
};

const bulkheadMiddleware = (maxConcurrent = 10) => {
  let currentRequests = 0;
  const queue = [];

  return (req, res, next) => {
    if (currentRequests >= maxConcurrent) {
      return res.status(503).json({
        message: 'Service temporarily overloaded, try again later',
        correlationId: req.correlationId,
        timestamp: new Date().toISOString(),
      });
    }

    currentRequests += 1;

    res.on('finish', () => {
      currentRequests -= 1;
    });

    next();
  };
};

module.exports = { createCircuitBreaker, withRetry, retryMiddleware, bulkheadMiddleware };
