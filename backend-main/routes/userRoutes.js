// routes/userRoutes.js
const express = require('express');
const { register, login ,getFriendsBalances,getTotalTrips,getTotalExpense,getTotalFriends,getCategorySummary,getRecentTripsSummary } = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/register', register); // signup
router.post('/login', login);       // login
router.get('/me/friends-balances',protect,getFriendsBalances);
router.get('/totalTrips', protect, getTotalTrips);
router.get('/totalExpense', protect, getTotalExpense);
router.get('/totalFriends', protect, getTotalFriends);
router.get('/categorySummary', protect, getCategorySummary);
router.get('/recentTripsSummary', protect, getRecentTripsSummary);



module.exports = router;
