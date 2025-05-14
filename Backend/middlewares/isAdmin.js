// middleware/isAdmin.js

module.exports = (req, res, next) => {
    // Check if user info is available and isAdmin is true
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  
    // User is admin, continue to route
    next();
  };
  