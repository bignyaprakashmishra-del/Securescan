// SecureScan Centralized Error Handler

function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal error occurred.';

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
