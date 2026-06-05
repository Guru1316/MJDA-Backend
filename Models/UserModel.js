const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  // Add these inside your existing userSchema in UserModel.js
  resetOtp: { type: String },
  resetOtpExpire: { type: Date } // 'student' or 'admin'
}, { 
  timestamps: true 
});

// Automatically hash the password before saving a user
userSchema.pre('save', async function() {
  // If the password hasn't been modified, exit the hook
  if (!this.isModified('password')) {
    return;
  }
  
  // Hash the password securely (No 'next()' needed for async hooks!)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);