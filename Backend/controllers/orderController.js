const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb');

const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: "Missing order data" });
    }

    const db = getDB();

    // ✅ Fetch full product details for each item
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await db.collection("products").findOne({ _id: new ObjectId(item.productId) });

        return {
          productId: item.productId,
          quantity: item.quantity,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image
          }
        };
      })
    );

    const totalAmount = enrichedItems.reduce((sum, item) => {
      return sum + parseFloat(item.product.price || 0) * (item.quantity || 1);
    }, 0);

    const order = {
      userId: req.user.id,
      items: enrichedItems,
      shippingAddress,
      totalAmount,
      createdAt: new Date(),
      orderStatus: 'Pending'
    };

    await db.collection("orders").insertOne(order);

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { placeOrder };
