const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb');
const categoryList = require('../utils/categoryList');

// USERS
exports.getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
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
};

exports.deleteUser = async (req, res) => {
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
};

// PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const { name, price, category } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
  const db = getDB();

  // ✅ Validate category
  if (!categoryList.includes(category)) {
    return res.status(400).json({ message: 'Invalid category. Allowed categories are: ' + categoryList.join(', ') });
  }

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
};


exports.updateProduct = async (req, res) => {
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
};

exports.deleteProduct = async (req, res) => {
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
};

// STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const db = getDB();
    const totalUsers = await db.collection('users').countDocuments();
    const totalProducts = await db.collection('products').countDocuments();
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
    res.status(500).json({ message: 'Failed to fetch admin stats', error: err.message });
  }
};

// ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
    const formattedOrders = orders.map(order => ({
      id: order._id,
      totalAmount: order.totalAmount || 0,
      createdAt: order.createdAt || new Date(),
      orderStatus: order.orderStatus || 'Pending'
    }));
    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  try {
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(order.userId) });

    const orderDetails = {
      id: order._id,
      totalAmount: order.totalAmount || 0,
      createdAt: order.createdAt || new Date(),
      orderStatus: order.orderStatus || 'Pending',
      user: user
        ? {
            name: user.name || '',
            email: user.email || '',
            address: user.address || '',
          }
        : null,
      items: order.items || [],
      paymentMethod: order.paymentMethod || '',
      shippingAddress: order.shippingAddress || '',
    };

    res.json(orderDetails);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order details', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Pending', 'On the way', 'Delivered', 'Cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { orderStatus: status } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
};
