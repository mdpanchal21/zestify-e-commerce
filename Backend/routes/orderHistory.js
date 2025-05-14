const express = require('express');
const router = express.Router();
const { getDB } = require('../config/dbMongo');

// GET /api/user-orders/:userId for get order into past order page 
router.get('/user-orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDB();
    const orders = await db.collection('orders').find({ userId }).toArray();
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
