function setCORSHeaders(res) {
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  // In production, use the allowed origins. In development, allow all.
  const origin = process.env.NODE_ENV === 'production' 
    ? allowedOrigins[0] || '*'
    : '*';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return true;
  }
  setCORSHeaders(res);
  return false;
}

module.exports = { setCORSHeaders, handleCORS };

