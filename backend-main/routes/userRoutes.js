// routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, getFriendsBalances, getDashboardSummary } = require('../controllers/userController');
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const protect = require('../middlewares/authMiddleware');
const handleValidationErrors = require('../middlewares/validate');
const { authLimiter, otpRequestLimiter, otpVerifyLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

const emailRule = body('email')
  .trim()
  .isEmail().withMessage('Enter a valid email address')
  .isLength({ max: 254 }).withMessage('Email address is too long')
  .normalizeEmail({ gmail_remove_dots: false });

const otpRules = [
  emailRule,
  body('otp')
    .trim()
    .matches(/^\d{6}$/).withMessage('Enter the 6-digit code'),
];

const registerRules = [
  body('signupToken').notEmpty().withMessage('Email verification is required'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers and underscores'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 60 }).withMessage('Name is required'),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required'),
];

// --- Signup: email -> OTP -> account ---
router.post('/send-otp', otpRequestLimiter, [emailRule], handleValidationErrors, sendOtp);
router.post('/verify-otp', otpVerifyLimiter, otpRules, handleValidationErrors, verifyOtp);
router.post('/register', authLimiter, registerRules, handleValidationErrors, register);

// --- Session ---
router.post('/login', authLimiter, loginRules, handleValidationErrors, login);

// --- Authenticated ---
router.get('/me/friends-balances', protect, getFriendsBalances);
router.get('/dashboard', protect, getDashboardSummary);

module.exports = router;
