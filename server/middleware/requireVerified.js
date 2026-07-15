const User = require('../models/User');

const requireVerified = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email to continue',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    next();
  } catch (err) {
    console.error('Error in requireVerified middleware:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = requireVerified;
