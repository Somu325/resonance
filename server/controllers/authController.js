const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const signup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({ email, password: hashedPassword });

  const token = generateToken(newUser._id);
  res.cookie('token', token, cookieOptions);

  res.status(201).json({ id: newUser._id, email: newUser.email });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions);

  res.status(200).json({ id: user._id, email: user.email });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user);
});

const githubCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
  const token = generateToken(req.user._id);
  res.cookie('token', token, cookieOptions);
  res.redirect(process.env.CLIENT_URL);
});

const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
  const token = generateToken(req.user._id);
  res.cookie('token', token, cookieOptions);
  res.redirect(process.env.CLIENT_URL);
});

module.exports = { signup, login, logout, me, githubCallback, googleCallback };