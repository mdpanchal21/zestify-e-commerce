const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectMongo() {
  try {
    await client.connect();
    db = client.db(); // default DB from URI
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

const getDB = () => db;

module.exports = { connectMongo, getDB };
