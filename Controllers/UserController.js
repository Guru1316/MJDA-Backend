const User = require('../Models/UserModel');
const generateToken = require('../Utils/generateToken');
const nodemailer = require('nodemailer');

// @desc    Register a new user (Create)
// @route   POST /api/users/signup
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dob, gender, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName, lastName, email, phone, dob, gender, password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        token: generateToken(user._id) // <--- SEND TOKEN
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user (Login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // SECURE ADMIN CHECK using .env
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.json({
        _id: 'admin_id',
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
        token: generateToken('admin_id') // <--- SEND ADMIN TOKEN
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        token: generateToken(user._id) // <--- SEND TOKEN
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (Generate OTP)
// @route   POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and expiration (10 minutes from now)
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // NOTE: In a real app, you would use Nodemailer here to email the OTP to the user.
    // For development, we will log it to the backend console so you can see it!

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: 'OTP sent successfully (Check server console!)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Find user with matching email, matching OTP, and OTP that hasn't expired yet
    const user = await User.findOne({ 
      email, 
      resetOtp: otp, 
      resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Double check OTP validity before resetting
    const user = await User.findOne({ 
      email, 
      resetOtp: otp, 
      resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired session. Please request a new OTP.' });
    }

    // Update password (your pre-save hook will hash it automatically)
    user.password = newPassword;
    
    // Clear the OTP fields so they can't be used again
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DON'T FORGET TO EXPORT THEM AT THE BOTTOM:
// module.exports = { ..., forgotPassword, verifyOTP, resetPassword };

module.exports = {
  createUser, loginUser, getUsers, getUserById, updateUser, deleteUser, forgotPassword, verifyOTP, resetPassword
};