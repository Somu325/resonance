const { body, validationResult } = require('express-validator');

const signupValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const analyzeValidator = [
  body('resumeText')
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ max: 20000 })
    .withMessage('Resume text must not exceed 20000 characters'),
  body('jdText')
    .notEmpty()
    .withMessage('Job description text is required')
    .isLength({ max: 20000 })
    .withMessage('Job description text must not exceed 20000 characters')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      message: firstError.msg,
      field: firstError.path || firstError.param
    });
  }
  next();
};

module.exports = {
  signupValidator,
  loginValidator,
  analyzeValidator,
  handleValidationErrors
};
