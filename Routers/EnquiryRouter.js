const express = require('express');
const router = express.Router();
const { createEnquiry, getEnquiries, updateEnquiryStatus } = require('../Controllers/EnquiryController');
const { protect, admin } = require('../Middleware/authMiddleware');

router.route('/')
  .post(createEnquiry) // Public: Anyone can contact
  .get(protect, admin, getEnquiries); // Admin: View all messages

router.put('/:id/reply', protect, admin, updateEnquiryStatus); // Admin: Mark as read/replied

module.exports = router;