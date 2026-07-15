const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  githubId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: false,
  },
  verificationTokenExpires: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);