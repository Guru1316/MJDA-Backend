const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./Routers/UserRouter');
const courseRoutes = require('./Routers/CourseRouter');       // <-- ADD THIS
const applicationRoutes = require('./Routers/ApplicationRouter'); // <-- ADD THIS
const enquiryRoutes = require('./Routers/EnquiryRouter');       // <-- ADD THIS

const app = express();

// Middleware
app.use(cors()); // Crucial for connecting to React!
app.use(express.json()); // Allows parsing of JSON bodies

// Database Connection
// Put your Atlas string in a .env file like: MONGO_URI=mongodb+srv://...
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);             // <-- ADD THIS
app.use('/api/applications', applicationRoutes);   // <-- ADD THIS
app.use('/api/enquiries', enquiryRoutes);          // <-- ADD THIS

// Basic Home Route
app.get('/', (req, res) => {
  res.send('MJ Dance Academy API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});