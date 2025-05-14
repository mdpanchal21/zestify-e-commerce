const { getDB } = require('../config/dbMongo');

const collection = () => getDB().collection('products');

exports.getAll = async () => {
  return await collection().find().toArray();
};

exports.getById = async (id) => {
  const { ObjectId } = require('mongodb');
  return await collection().findOne({ _id: new ObjectId(id) });
};

exports.create = async (data) => {
  return await collection().insertOne(data);
};

exports.update = async (id, data) => {
  const { ObjectId } = require('mongodb');
  return await collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );
};

exports.remove = async (id) => {
  const { ObjectId } = require('mongodb');
  return await collection().deleteOne({ _id: new ObjectId(id) });
};

exports.aggregateByCategory = async () => {
  return await collection().aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } }
  ]).toArray();
};
