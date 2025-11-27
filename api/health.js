const { handleCORS } = require('./_lib/cors');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  res.json({
    message: 'Server is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

