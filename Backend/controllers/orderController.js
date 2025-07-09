const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb');

const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: "Missing order data" });
    }

    const { line1, city, state, zip, country } = shippingAddress;
    if (!line1 || !city || !state || !zip || !country) {
      return res.status(400).json({ message: "Incomplete shipping address" });
    }

    const db = getDB();
    const userId = new ObjectId(req.user.id);

    // Fetch full product details
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
      userId: userId,
      items: enrichedItems,
      shippingAddress: { line1, city, state, zip, country },
      totalAmount,
      createdAt: new Date(),
      orderStatus: 'Pending'
    };

    // Save order
    await db.collection("orders").insertOne(order);

    // 🟢 If this is the user's first order, save the address
    const existingOrders = await db.collection("orders").find({ userId }).toArray();
    if (existingOrders.length === 1) {
      const fullAddress = `${line1}, ${city}, ${state}, ${zip}, ${country}`;
      await db.collection("users").updateOne(
        { _id: userId },
        { $set: { address: fullAddress } }
      );
    }

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRecentOrderAddress = async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.user.id);

  try {
    const recentOrder = await db.collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 }) // sort by latest
      .limit(1)
      .toArray();

    if (recentOrder.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const shippingAddress = recentOrder[0].shippingAddress;
    const fullAddress = `${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zip}, ${shippingAddress.country}`;

    return res.json({ shippingAddress: fullAddress });
  } catch (err) {
    console.error("Error fetching recent order address:", err);
    res.status(500).json({ message: "Failed to fetch recent address" });
  }
};


module.exports = { placeOrder , getRecentOrderAddress };



