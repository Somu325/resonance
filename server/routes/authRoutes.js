const express = require('express');
const router = express.Router();
const { signup, login, logout, me } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupValidator, loginValidator, handleValidationErrors } = require('../middleware/validators');

router.post('/signup', authLimiter, signupValidator, handleValidationErrors, signup);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;