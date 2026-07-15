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
  // Lifetime usage totals (caps of 5 each are enforced in middleware, not stored on the schema)
  analysesUsed: {
    type: Number,
    default: 0,
  },
  suggestionsUsed: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);