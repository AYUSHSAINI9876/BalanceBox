// routes/tripRoutes.js
const express = require('express');
const protect = require('../middlewares/authMiddleware');
const { createTrip,getUserTrips,getTripCategoryExpenses,getTripTotalExpense,getUserCategoryExpensesInTrip,getTripDetails,getTripMembersExpenseSummary,addExpense ,getExpenses,getBalanceMatrix,getMyBalancesInTrip,editExpense,getExpenseById,deleteExpense} = require('../controllers/tripController');


const router = express.Router();

router.post('/create', protect, createTrip);
router.get('/my-trips', protect, getUserTrips);
router.get('/:tripId',protect, getTripDetails);
router.get('/:tripId/totalExpense', protect, getTripTotalExpense);
router.get('/:tripId/category-expenses', protect, getTripCategoryExpenses);
router.get('/:tripId/membersExpenseSummary', protect, getTripMembersExpenseSummary);
router.post('/:tripId/expenses',protect, addExpense);
router.get('/:tripId/expenses', protect, getExpenses); 
router.get('/:tripId/balanceMatrix',protect, getBalanceMatrix);
router.get('/:tripId/my-balances', protect, getMyBalancesInTrip);
router.put('/:tripId/expenses/:expenseId', protect, editExpense);
router.get('/:tripId/expenses/:expenseId',protect, getExpenseById);
router.delete('/:tripId/expenses/:expenseId', protect, deleteExpense);
router.get('/:tripId/user/category-expenses', protect, getUserCategoryExpensesInTrip);


module.exports = router;
