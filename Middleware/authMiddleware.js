const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel'); // Adjust path if needed

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- FIX: Handle the hardcoded Admin before hitting the DB ---
      if (decoded.id === 'admin_id') {
        req.user = {
          _id: 'admin_id',
          name: 'Administrator',
          email: process.env.ADMIN_EMAIL,
          role: 'admin'
        };
        return next();
      }

      // Normal student database lookup
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };