const { getDB } = require('../config/dbMongo');
const { ObjectId } = require('mongodb');

const collection = () => getDB().collection('carts');

exports.addToCart = async (userId, product) => {
  return await collection().updateOne(
    { userId },
    { $push: { items: product } },
    { upsert: true }
  );
};

exports.getCart = async (userId) => {
  return await collection().findOne({ userId });
};

exports.clearCart = async (userId) => {
  return await collection().deleteOne({ userId });
};
