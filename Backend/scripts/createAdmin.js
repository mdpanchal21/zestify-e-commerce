#!/usr/bin/env node

const readline = require('readline');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    const name = await askQuestion('Enter admin name: ');
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password: ');

    const existing = await users.findOne({ email });
    if (existing) {
      console.log('❌ Admin with this email already exists.');
      rl.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
    });

    console.log('✅ Admin user created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
    await client.close();
  }
}

createAdmin();
