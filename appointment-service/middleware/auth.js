const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
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
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'Insufficient permissions',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  return next();
};

module.exports = { authenticate, authorize };
