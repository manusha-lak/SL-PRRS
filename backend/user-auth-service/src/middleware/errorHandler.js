/**
 * Global error handler middleware.
 * Must be registered LAST in Express.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';

  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${message}`);

  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = { errorHandler };
