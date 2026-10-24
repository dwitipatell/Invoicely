export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Express recognises error handlers by their 4 arguments, so `next` must stay
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'That name already exists.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID.' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Something went wrong on the server.' });
}
