const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/dbMongo');
const sendEmail = require('../utils/sendEmail');


exports.register = async (req, res) => {
 const { name, email, password, phone } = req.body;
  const db = getDB();

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { name, email, password: hashedPassword, phone , createdAt: new Date()};

    await db.collection('users').insertOne(user);

    // ✅ Send email
    const subject = 'Welcome to Our Shop!';
    // image was upload in imgBB free server link : https://ibb.co/7tX4zX7Q
    const html = `
  <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #eee; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px;">
      <img src="https://i.ibb.co/ZzVmJVyS/zestify.png" alt="Shop Logo" width="120" />
    </div>
    <h2 style="color: #333;">Welcome, ${name} 👋</h2>
    <p style="font-size: 16px; color: #555;">
      Thank you for registering at <strong>Our Shop</strong>! We're excited to have you join our shopping community.
    </p>

    <div style="margin-top: 20px;">
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    </div>

    <div style="margin-top: 30px;">
      <a href="https://your-ecommerce-site.com" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none;">
        Start Shopping 🛍️
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #888;">
      If you have any questions, feel free to reply to this email. We're here to help!
    </p>

    <hr style="margin-top: 40px;" />
    <p style="font-size: 12px; color: #aaa; text-align: center;">
      &copy; ${new Date().getFullYear()} Our Shop. All rights reserved.
    </p>
  </div>
`;

    await sendEmail(email, subject, html);

    res.status(201).json({
      message: 'User registered successfully.',
      user: { name, email, phone },
    });
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

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const db = getDB();

  // 1. Basic input validation
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // 2. Confirm new passwords match
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  try {
    // 3. Get user from decoded JWT
    const user = await db.collection('users').findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. Check old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // 5. Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from old password' });
    }

    // 6. Hash and update the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(
      { email: req.user.email },
      { $set: { password: hashedNewPassword } }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err.message });
  }
};
