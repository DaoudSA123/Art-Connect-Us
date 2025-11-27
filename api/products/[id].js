const { handleCORS } = require('../_lib/cors');
const products = require('../_lib/products');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'GET') {
    const { id } = req.query;
    const product = products.find(p => p.id === parseInt(id));
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

