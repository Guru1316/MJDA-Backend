const Course = require('../Models/CourseModel');

// @desc    Get all courses (Public)
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create a course (Admin Only)
const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Update a course (Admin Only)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Delete a course (Admin Only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };