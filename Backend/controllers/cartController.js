const Cart = require('../models/cartModel');

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const product = req.body;
  await Cart.addToCart(userId, product);
  res.json({ message: 'Product added to cart' });
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.getCart(userId);
  res.json(cart || { items: [] });
};

exports.clearCart = async (req, res) => {
  const userId = req.user.id;
  await Cart.clearCart(userId);
  res.json({ message: 'Cart cleared' });
};
