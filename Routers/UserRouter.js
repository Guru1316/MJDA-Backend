const express = require('express');
const router = express.Router();
const { protect, admin } = require('../Middleware/authMiddleware'); // <--- Import middleware
const {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../Controllers/UserController');

// Public routes
router.post('/signup', createUser);
router.post('/login', loginUser);

// Add these to your public routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes (Requires Token)
router.route('/')
  .get(protect, admin, getUsers); // Only Admins can get ALL users

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser); // Only Admins can delete users

module.exports = router;