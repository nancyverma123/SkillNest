// Every error leaves the API as { message } with an appropriate status code.
exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must be valid JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large' });
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({ message: first?.message || 'Invalid data' });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid value for ${err.path}` });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with these details already exists' });
  console.error(err);
  return res.status(500).json({ message: 'Server error' });
};
