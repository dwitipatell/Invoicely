export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Express identifies error handlers by their 4-argument signature, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.name === 'ValidationError' ? 400 : 500;
  res.status(status).json({ message: err.message || 'Server error' });
}
