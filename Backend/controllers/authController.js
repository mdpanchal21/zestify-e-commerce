const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/dbMongo');

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const db = getDB();

  // Validate that all required fields are provided
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All fields are required'});
  }

  try {
    // Check if the email already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user object
    const user = { name, email, password: hashedPassword, phone };

    // Insert the new user into the database
    await db.collection('users').insertOne(user);

    // Send success response
    res.status(201).json({ message: 'User registered successfully', user: { name, email, phone } });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email , isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Include user object in response
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

