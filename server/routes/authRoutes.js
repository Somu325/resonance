const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signup, login, logout, me, githubCallback, googleCallback } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupValidator, loginValidator, handleValidationErrors } = require('../middleware/validators');

router.post('/signup', authLimiter, signupValidator, handleValidationErrors, signup);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), githubCallback);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), googleCallback);

module.exports = router;