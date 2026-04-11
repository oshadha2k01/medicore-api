const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map((d) => d.message),
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  req[source] = value;
  return next();
};

module.exports = validate;
