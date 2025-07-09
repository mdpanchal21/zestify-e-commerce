const express = require('express');
const router = express.Router();
const { placeOrder , getRecentOrderAddress } = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/place', authMiddleware, placeOrder);
router.get("/recent-address", authMiddleware, getRecentOrderAddress);
module.exports = router;
