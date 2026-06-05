const express = require('express');
const router = express.Router();
const { createApplication, getMyApplications, getApplications, updateAppStatus } = require('../Controllers/ApplicationController');
const { protect, admin } = require('../Middleware/authMiddleware');

router.route('/')
  .post(protect, createApplication) // Student: Submit app
  .get(protect, admin, getApplications); // Admin: View all apps

router.get('/myapps', protect, getMyApplications); // Student: View their own apps (Dashboard)

router.put('/:id/status', protect, admin, updateAppStatus); // Admin: Approve/Reject

module.exports = router;