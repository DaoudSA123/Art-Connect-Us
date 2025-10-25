const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample product data
const products = [
  {
    id: 1,
    name: "Midnight Hoodie",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=500&h=500&fit=crop",
    category: "Hoodies",
    description: "Premium dark navy hoodie with luxury streetwear design",
    inStock: true
  },
  {
    id: 2,
    name: "Shadow Tee",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    category: "T-Shirts",
    description: "Minimalist black tee with subtle branding",
    inStock: false
  },
  {
    id: 3,
    name: "Crimson Crewneck",
    price: 65.99,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop",
    category: "Sweaters",
    description: "Matte maroon crewneck with premium cotton blend",
    inStock: true
  },
  {
    id: 4,
    name: "Obsidian Cap",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop",
    category: "Accessories",
    description: "Black premium cap with embroidered logo",
    inStock: true
  },
  {
    id: 5,
    name: "Midnight Joggers",
    price: 75.99,
    image: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=500&h=500&fit=crop",
    category: "Pants",
    description: "Dark navy joggers with tapered fit",
    inStock: true
  },
  {
    id: 6,
    name: "Shadow Jacket",
    price: 125.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
    category: "Jackets",
    description: "Black bomber jacket with premium materials",
    inStock: false
  },
  {
    id: 7,
    name: "Navy Sweatshirt",
    price: 55.99,
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=500&fit=crop",
    category: "Sweaters",
    description: "Classic navy sweatshirt with modern fit",
    inStock: true
  },
  {
    id: 8,
    name: "Maroon Beanie",
    price: 25.99,
    image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=500&h=500&fit=crop",
    category: "Accessories",
    description: "Warm matte maroon beanie for cold seasons",
    inStock: true
  }
];

// Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
