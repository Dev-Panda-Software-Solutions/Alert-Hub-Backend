const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  const status = err.status || err.statusCode || 500;

  // Below 500 = an error the app deliberately raised with a safe, user-facing message
  // (validation, not-found, permission checks, etc.) — always fine to show as-is.
  // 500 = unexpected (e.g. a raw Prisma/driver error) — its .message can contain internal
  // details (file paths, query text, DB host/user), so never forward it to the client in production.
  const safeToExpose = status < 500 || process.env.NODE_ENV !== 'production';

  res.status(status).json({
    error: safeToExpose ? (err.message || 'Internal server error') : 'Internal server error. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
