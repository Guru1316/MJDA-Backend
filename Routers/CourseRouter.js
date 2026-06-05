const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../Controllers/CourseController');
const { protect, admin } = require('../Middleware/authMiddleware');

router.route('/')
  .get(getCourses) // Public: Anyone can see courses
  .post(protect, admin, createCourse); // Admin: Create a course

router.route('/:id')
  .put(protect, admin, updateCourse) // Admin: Edit course
  .delete(protect, admin, deleteCourse); // Admin: Delete course

module.exports = router;