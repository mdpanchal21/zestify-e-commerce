const express = require('express');
const cors = require('cors');
const fs = require('fs');
// const path = require('path');
const path = require('path');
const { connectMongo } = require('./config/dbMongo');
require('dotenv').config();
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cart');
const userOrderRoutes = require('./routes/orderHistory');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// 🔹 Serve static images from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectMongo(); // Connect to MongoDB

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product')); // this api is for show products 
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', userOrderRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/admin', adminRoutes);

module.exports = app;
