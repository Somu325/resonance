const crypto = require('crypto');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const { sendVerificationEmail } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

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

  // Generate a token: crypto.randomBytes(32).toString('hex')
  const verificationToken = crypto.randomBytes(32).toString('hex');
  newUser.verificationToken = verificationToken;
  newUser.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await newUser.save();

  let emailSendFailed = false;
  try {
    await sendVerificationEmail(newUser.email, verificationToken);
  } catch (err) {
    logger.error('Failed to send verification email on signup:', { error: err.message, stack: err.stack });
    emailSendFailed = true;
  }

  logger.info('User signup successful', { event: 'signup', userId: newUser._id, email: newUser.email, method: 'password' });

  const token = generateToken(newUser._id);
  res.cookie('token', token, cookieOptions);

  res.status(201).json({ id: newUser._id, email: newUser.email, emailSendFailed });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    logger.info('User login failed', { event: 'login_failed', email, reason: 'invalid_credentials' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    logger.info('User login failed', { event: 'login_failed', email, reason: 'invalid_credentials' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  logger.info('User login successful', { event: 'login', userId: user._id, email: user.email, method: 'password' });

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions);

  res.status(200).json({ id: user._id, email: user.email });
});

const logout = asyncHandler(async (req, res) => {
  logger.info('User logout', { event: 'logout', userId: req.userId });
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const userObj = user.toObject();
  const hasPassword = !!user.password;
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.verificationTokenExpires;

  res.status(200).json({ 
    ...userObj, 
    analysesUsed: user.analysesUsed ?? 0,
    suggestionsUsed: user.suggestionsUsed ?? 0,
    hasPassword 
  });
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

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    logger.info('Email verification failed', { event: 'email_verify_failed', reason: 'invalid_or_expired_token' });
    return res.status(400).json({ message: 'Verification token is required' });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    logger.info('Email verification failed', { event: 'email_verify_failed', reason: 'invalid_or_expired_token' });
    return res.status(400).json({ message: 'Invalid or expired verification link' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  logger.info('Email verified successfully', { event: 'email_verified', userId: user._id, email: user.email });

  res.status(200).json({ message: 'Email verified' });
});

const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'Email already verified' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    logger.error('Failed to send verification email on resend:', { error: err.message, stack: err.stack });
    return res.status(500).json({ message: 'Failed to send verification email' });
  }

  res.status(200).json({ message: 'Verification email sent' });
});

const changeEmail = asyncHandler(async (req, res) => {
  const { newEmail, currentPassword } = req.body;

  if (!newEmail) {
    return res.status(400).json({ message: 'New email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.password) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required to verify identity' });
    }
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
  }

  const existingUser = await User.findOne({ email: newEmail, _id: { $ne: req.userId } });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const oldEmail = user.email;
  user.email = newEmail;
  user.isVerified = false;

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  let emailSendFailed = false;
  try {
    await sendVerificationEmail(newEmail, verificationToken);
  } catch (err) {
    logger.error('Failed to send verification email on email change:', { error: err.message, stack: err.stack });
    emailSendFailed = true;
  }

  logger.info('User changed email address', { event: 'email_changed', userId: req.userId, oldEmail, newEmail });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.verificationTokenExpires;

  res.status(200).json({ ...userObj, emailSendFailed });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { currentPassword } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.password) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required to verify identity' });
    }
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
  }

  const email = user.email;

  // Delete all Analysis documents associated with this user
  await Analysis.deleteMany({ userId: req.userId });

  // Delete the User document
  await User.findByIdAndDelete(req.userId);

  logger.info('User deleted account', { event: 'account_deleted', userId: req.userId, email });

  // Clear cookie
  res.clearCookie('token', cookieOptions);

  res.status(200).json({ message: 'Account deleted' });
});

module.exports = { 
  signup, 
  login, 
  logout, 
  me, 
  githubCallback, 
  googleCallback,
  verifyEmail,
  resendVerification,
  changeEmail,
  deleteAccount
};