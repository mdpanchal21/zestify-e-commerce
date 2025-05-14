const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const authMiddleware = require('../middlewares/authMiddleware');
const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb');
const upload = require('../middlewares/upload'); // import multer middleware

// for get user as admin
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  const db = require('../config/dbMongo').getDB();
  const users = await db.collection('users').find().toArray();
  res.json(users);
});

// Update user as admin
router.put('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { name, email, isAdmin } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (typeof isAdmin === 'boolean') updateFields.isAdmin = isAdmin;

  try {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Delete user as admin
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  try {
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// Add more routes like manage products, view orders, etc.
// for get product as admin
router.get('/products', authMiddleware, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// for update product as admins
router.put('/products/:id', authMiddleware, isAdmin, upload.single('image'), async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const { name, price, category } = req.body;


  const updateFields = {};
  if (name) updateFields.name = name;
  if (price) updateFields.price = parseFloat(price);
  if (category) updateFields.category = category;
  if (req.file) updateFields.image = `/uploads/${req.file.filename}`;

  try {
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});


// for delete product as admin
router.delete('/products/:id', authMiddleware, isAdmin, async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  try {
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

// Admin Dashboard Stats for main admin dashboard show all details like total product etc
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const db = getDB();

    // Total users
    const totalUsers = await db.collection('users').countDocuments();

    // Total products
    const totalProducts = await db.collection('products').countDocuments();

    // Total orders and total sales
    const orders = await db.collection('orders').find().toArray();
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch admin stats', error: err.message });
  }
});

// admin.js

// for creating product as admin
router.post('/products', authMiddleware, isAdmin, upload.single('image'), async (req, res) => {
  const { name, price, category } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  const db = getDB();
  try {
    const result = await db.collection('products').insertOne({
      name,
      price: parseFloat(price),
      category,
      image: imagePath,
    });

    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
});


module.exports = router;
