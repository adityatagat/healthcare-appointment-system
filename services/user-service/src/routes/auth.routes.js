const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate-request.middleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('firstName').not().isEmpty().withMessage('First name is required'),
    body('lastName').not().isEmpty().withMessage('Last name is required'),
  ],
  validateRequest,
  authController.register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authController.protect, authController.getMe);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please include a valid email')],
  validateRequest,
  authController.forgotPassword
);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  validateRequest,
  authController.resetPassword
);

module.exports = router;
