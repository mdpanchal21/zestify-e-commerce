const express = require('express');
const router = express.Router();
const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB();

    const cart = await db.collection('carts').findOne({ userId: req.user.id });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.json({ items: [] });
    }

    const productIds = cart.items.map(item => {
      return typeof item.productId === 'string'
        ? new ObjectId(item.productId)
        : item.productId;
    });

    const products = await db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray();

    const populatedItems = cart.items.map(item => {
      const product = products.find(
        p => p._id.toString() === item.productId.toString()
      );
      return {
        ...item,
        product: product || null,
      };
    });

    res.json({ items: populatedItems });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const cartCollection = db.collection('carts');
    const existingCart = await cartCollection.findOne({ userId });

    if (existingCart) {
      const existingItem = existingCart.items.find(
        item => item.productId === productId
      );

      if (existingItem) {
        await cartCollection.updateOne(
          {
            userId,
            'items.productId': productId,
          },
          {
            $inc: { 'items.$.quantity': quantity },
          }
        );

        return res.json({ message: 'Cart updated', updated: true });
      } else {
        await cartCollection.updateOne(
          { userId },
          {
            $push: {
              items: {
                productId,
                quantity,
              },
            },
          }
        );

        return res.json({ message: 'Product added to cart', added: true });
      }
    } else {
      await cartCollection.insertOne({
        userId,
        items: [{ productId, quantity }],
      });

      return res.json({ message: 'Cart created and product added', created: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();

    const result = await db.collection('carts').updateOne(
      { userId },
      {
        $pull: {
          items: {
            productId: productId,
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
  
router.put('/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const db = getDB();
    const userId = req.user.id;

    const result = await db.collection('carts').updateOne(
      { userId },
      {
        $set: {
          'items.$[elem].quantity': quantity,
        },
      },
      {
        arrayFilters: [{ 'elem.productId': productId }],
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Quantity updated successfully' });
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear entire cart for a user
router.delete('/clear/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDB(); // make sure you have a getDb() method or access to MongoDB
    await db.collection('carts').deleteOne({ userId }); // or updateOne({ userId }, { $set: { items: [] } })
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Failed to clear cart:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
