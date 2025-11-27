function setCORSHeaders(res, req) {
  // Get the origin from the request
  const requestOrigin = req.headers.origin || req.headers.referer;
  
  // In production on Vercel, allow same-origin requests (no origin header means same origin)
  // Also allow requests from the Vercel domain
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : [];
    
    // If no origin header, it's a same-origin request (frontend and API on same domain)
    if (!requestOrigin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.length > 0 && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else {
      // Allow same domain requests (Vercel)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    // Development: allow all
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req);
    res.status(200).end();
    return true;
  }
  setCORSHeaders(res, req);
  return false;
}

module.exports = { setCORSHeaders, handleCORS };

