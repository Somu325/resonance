const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Factory function to create usage limit enforcement middleware.
 * @param {string} field - The user field representing usage count (e.g. 'analysesUsed')
 * @param {number} max - The maximum limit allowed
 * @param {string} [customMessage] - Optional custom error message
 */
const checkUsageLimit = (field, max, customMessage) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUsage = user[field] || 0;
    if (currentUsage >= max) {
      let message = customMessage;
      if (!message) {
        if (field === 'suggestionsUsed') {
          message = `You've reached your limit of ${max} free suggestions.`;
        } else {
          message = `You've reached your limit of ${max} free analyses.`;
        }
      }

      return res.status(403).json({
        message,
        code: 'USAGE_LIMIT_REACHED',
      });
    }

    next();
  });
};

module.exports = checkUsageLimit;
