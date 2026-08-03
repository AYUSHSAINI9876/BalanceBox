// routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, getFriendsBalances, getDashboardSummary } = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');
const handleValidationErrors = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

const registerRules = [
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
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerRules, handleValidationErrors, register);
router.post('/login', authLimiter, loginRules, handleValidationErrors, login);
router.get('/me/friends-balances', protect, getFriendsBalances);
router.get('/dashboard', protect, getDashboardSummary);

module.exports = router;
