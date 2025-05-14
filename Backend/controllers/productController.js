const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
  const products = await Product.getAll();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.getById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// productController.js

exports.createProduct = async (req, res) => {
  const { name, price, category } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const db = getDB();
    const result = await db.collection('products').insertOne({
      name,
      price: parseFloat(price),
      category,
      image: imagePath,
    });

    res.status(201).json({ message: 'Product created successfully', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};


exports.updateProduct = async (req, res) => {
  const result = await Product.update(req.params.id, req.body);
  if (result.matchedCount === 0) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Product updated" });
};

exports.deleteProduct = async (req, res) => {
  const result = await Product.remove(req.params.id);
  if (result.deletedCount === 0) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Product deleted" });
};

exports.getCategoryStats = async (req, res) => {
  const stats = await Product.aggregateByCategory();
  res.json(stats);
};
