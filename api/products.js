const { handleCORS } = require('./_lib/cors');
const products = require('./_lib/products');

module.exports = async (req, res) => {
  try {
    if (handleCORS(req, res)) return;

    if (req.method === 'GET') {
      res.json(products);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

