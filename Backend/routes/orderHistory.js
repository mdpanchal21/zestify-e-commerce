const express = require('express');
const router = express.Router();
const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb'); // Added for ObjectId conversion

// GET /api/user-orders/:userId for get order into past order page 
router.get('/user-orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDB();
    // Convert userId to ObjectId for correct querying
    const orders = await db.collection('orders').find({ userId: new ObjectId(userId) }).toArray();
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
