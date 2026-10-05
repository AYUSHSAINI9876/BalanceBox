const User = require('../models/User');  
const Trip = require('../models/Trip');
const FriendRequest = require('../models/FriendRequest');




// controllers/tripController.js
exports.createTrip = async (req, res) => {
  try {
    const { title, memberUsernames } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: "Trip name is required" });
    }
    if (title.length > 100) {
      return res.status(400).json({ message: "Trip name is too long" });
    }
    if (!Array.isArray(memberUsernames) || memberUsernames.length === 0) {
      return res.status(400).json({ message: "Add at least one member username" });
    }
    if (memberUsernames.length > 50) {
      return res.status(400).json({ message: "A trip can have at most 50 members" });
    }
    if (!memberUsernames.every(u => typeof u === 'string' && u.trim())) {
      return res.status(400).json({ message: "Member usernames must be non-empty text" });
    }

    const uniqueUsernames = [...new Set(memberUsernames.map(u => u.trim()))];

    // 1. Fetch all members
    const members = await User.find({ username: { $in: uniqueUsernames } });

    if (members.length !== uniqueUsernames.length) {
      const found = new Set(members.map(m => m.username));
      const missing = uniqueUsernames.filter(u => !found.has(u));
      return res.status(400).json({ message: `Not registered: ${missing.join(', ')}` });
    }

// 2. Convert to IDs
let memberIds = members.map(m => m._id.toString());

    // 2. Include trip creator
    if (!memberIds.includes(req.user.id)) {
      memberIds.push(req.user.id);
      // Also push the creator's User object to members
      const creator = await User.findById(req.user.id);
      if (creator) members.push(creator);
    }

    // 3. Sort by username
    members.sort((a, b) => a.username.localeCompare(b.username));
    memberIds = members.map(m => m._id);

    // Initialize balanceMatrix as a zero matrix
    const n = memberIds.length;
    const balanceMatrix = Array(n).fill().map(() => Array(n).fill(0));

    const trip = new Trip({ title: title.trim(), members: memberIds, createdBy: req.user.id, balanceMatrix });
    await trip.save();

    res.status(201).json({ message: "Trip created successfully!", tripId: trip._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all trips of the logged-in user
exports.getUserTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const trips = await Trip.find({ members: userId })
      .select('title members createdBy createdAt updatedAt')
      .populate('members', 'username name')
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(trips);  // Array of trips
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTripDetails = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate('members', 'username name')
      .lean();
    if (!trip) return res.status(404).json({ message: "Trip not found" });

  // 🔐 Check if logged-in user is a trip member
    const isMember = trip.members.some(
      member => member._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not part of this trip" });
    }

    res.status(200).json(trip); // trip ke members ke saath
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  const { tripId } = req.params;
  try {
    const trip = await Trip.findById(tripId).populate(
      'expenses.paidBy.user',
      'username name'
    ).populate(
      'expenses.splitBetween',
      'username name'
    ).lean();

    if (!trip) return res.status(404).json({ message: "Trip not found" });

 // 🔐 Check if logged-in user is a trip member
    const isMember = trip.members.some(
      member => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not part of this trip" });
    }

    // Sort by most recent
    trip.expenses.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

    res.status(200).json(trip.expenses);  // array of expenses
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





function isTripMember(trip, userId) {
  return trip.members.some(m => (m._id || m).toString() === userId);
}

function validateExpensePayload({ description, amount, paidBy, splitBetween, category }) {
  if (typeof description !== 'string' || !description.trim()) return 'Description is required';
  if (description.length > 200) return 'Description is too long';
  if (typeof category !== 'string' || !category.trim()) return 'Category is required';
  if (category.length > 50) return 'Category name is too long';
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return 'Amount must be a number greater than 0';
  }
  if (!Array.isArray(paidBy) || paidBy.length === 0) return 'At least one payer is required';
  for (const p of paidBy) {
    if (!p || !p.user) return 'Each payer must be selected';
    if (typeof p.amount !== 'number' || !Number.isFinite(p.amount) || p.amount <= 0) {
      return 'Each payer amount must be a number greater than 0';
    }
  }
  if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
    return 'Select at least one member to split between';
  }
  const uniqueSplit = new Set(splitBetween.map(String));
  if (uniqueSplit.size !== splitBetween.length) return 'Duplicate members in split list';
  return null;
}

// Helper function to update balanceMatrix

  function updateBalanceMatrix(trip, expense) {
  const members = trip.members;  // already array of ObjectIds in trip
  const n = members.length;

  // init balanceMatrix if empty or wrong size
  if (!trip.balanceMatrix || trip.balanceMatrix.length !== n) {
    trip.balanceMatrix = Array(n).fill().map(() => Array(n).fill(0));
  }

  // Split each payer's own contribution equally across the split members, so
  // with several payers a member owes each payer only a share of what they paid.
  const splitCount = expense.splitBetween.length;

  expense.paidBy.forEach(payer => {
    const payerIndex = members.findIndex(m => m.equals(payer.user));
    const share = Number(payer.amount) / splitCount;
    expense.splitBetween.forEach(splitUser => {
      const splitIndex = members.findIndex(m => m.equals(splitUser));
      if (splitIndex !== payerIndex) {
        trip.balanceMatrix[splitIndex][payerIndex] += share;
        trip.balanceMatrix[payerIndex][splitIndex] -= share;
      }
    });
  });

  return trip.balanceMatrix;
}


// Add expense to trip
exports.addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { description, amount, paidBy, splitBetween, category } = req.body;

    const validationError = validateExpensePayload({ description, amount, paidBy, splitBetween, category });
    if (validationError) return res.status(400).json({ message: validationError });

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Validate trip members
    const tripMembers = trip.members.map(m => m.toString());
    if (!tripMembers.includes(req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this trip" });
    }
    // Validate trip members
    const allUserIds = [...paidBy.map(p => p.user), ...splitBetween];
    for (let uid of allUserIds) {
      if (!tripMembers.includes(String(uid))) {
        return res.status(400).json({ message: `User ${uid} is not part of the trip` });
      }
    }

    // Validate sum of paidBy (tolerant of floating-point rounding)
    const totalPaid = paidBy.reduce((sum, p) => sum + Number(p.amount), 0);
    if (Math.abs(totalPaid - Number(amount)) > 0.01) {
      return res.status(400).json({
        message: `Total paid (${totalPaid}) must equal expense amount (${amount})`
      });
    }

    // Push new expense
    const newExpense = { description, amount, paidBy, splitBetween, category };
    trip.expenses.push(newExpense);

    // Update balanceMatrix
    updateBalanceMatrix(trip, newExpense);

    await trip.save();

    return res.status(201).json({ 
      message: "Expense added & balance updated!",
      balanceMatrix: trip.balanceMatrix 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get balance matrix
exports.getBalanceMatrix = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).select('members balanceMatrix').lean();
    if (!trip) return res.status(404).json({ message: "Trip not found" });

 // 🔐 Check if logged-in user is a trip member
    const isMember = trip.members.some(
      member => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not part of this trip" });
    }

    return res.status(200).json({ balanceMatrix: trip.balanceMatrix });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    const trip = await Trip.findById(tripId)
      .populate('expenses.paidBy.user', 'username name')
      .populate('expenses.splitBetween', 'username name');

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const expense = trip.expenses.id(expenseId); // Mongo subdocument search
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    // ✅ Authorization check: allow any trip member
    const loggedInUserId = req.user.id;
    const isTripMember = trip.members.some(m => m.equals(loggedInUserId));
    if (!isTripMember) {
      return res.status(403).json({ message: "Not authorized to view this expense" });
    }

    res.status(200).json(expense); // Return the expense
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit expense
exports.editExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const { description, amount, paidBy, splitBetween, category } = req.body;

    const validationError = validateExpensePayload({ description, amount, paidBy, splitBetween, category });
    if (validationError) return res.status(400).json({ message: validationError });

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Check auth: any trip member can edit
    if (!trip.members.some(m => m.equals(req.user.id))) {
      return res.status(403).json({ message: "You're not a member of this trip" });
    }

    // Find expense
    const expenseIndex = trip.expenses.findIndex(e => e._id.equals(expenseId));
    if (expenseIndex === -1) return res.status(404).json({ message: "Expense not found" });

    const tripMembers = trip.members.map(m => m.toString());
    for (const uid of [...paidBy.map(p => p.user), ...splitBetween]) {
      if (!tripMembers.includes(String(uid))) {
        return res.status(400).json({ message: `User ${uid} is not part of the trip` });
      }
    }

    // Validate paidBy sum (tolerant of floating-point rounding)
    const totalPaid = paidBy.reduce((sum, p) => sum + Number(p.amount), 0);
    if (Math.abs(totalPaid - Number(amount)) > 0.01) {
      return res.status(400).json({ message: "Total paid must equal expense amount" });
    }

    // Edit expense
    trip.expenses[expenseIndex] = { description, amount, paidBy, splitBetween, category, _id: expenseId };
    // Recalculate balanceMatrix
    trip.balanceMatrix = Array(trip.members.length).fill().map(() => Array(trip.members.length).fill(0));
    trip.expenses.forEach(exp => updateBalanceMatrix(trip, exp));
    await trip.save();

    res.status(200).json({ message: "Expense updated successfully", balanceMatrix: trip.balanceMatrix });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Check auth
    if (!trip.members.some(m => m.equals(req.user.id))) {
      return res.status(403).json({ message: "You're not a member of this trip" });
    }

    const index = trip.expenses.findIndex(e => e._id.equals(expenseId));
    if (index === -1) return res.status(404).json({ message: "Expense not found" });

    // Remove expense
    trip.expenses.splice(index, 1);

    // Reset balanceMatrix
    trip.balanceMatrix = Array(trip.members.length).fill().map(() => Array(trip.members.length).fill(0));
    trip.expenses.forEach(exp => updateBalanceMatrix(trip, exp));
    await trip.save();

    res.status(200).json({ message: "Expense deleted successfully", balanceMatrix: trip.balanceMatrix });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get my personal balances within a trip
exports.getMyBalancesInTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Fetch trip & members
    const trip = await Trip.findById(tripId)
      .select('members balanceMatrix')
      .populate('members', 'username name')
      .lean();
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Check if user is in trip
    const index = trip.members.findIndex(m => m._id.equals(userId));
    if (index === -1) return res.status(403).json({ message: "You are not part of this trip" });

    let balances;
    if (!trip.balanceMatrix || !Array.isArray(trip.balanceMatrix) || trip.balanceMatrix.length !== trip.members.length) {
      // No expenses yet, return all other members with balance 0
      balances = trip.members.map((member, i) => {
        if (i === index) return null;
        return {
          userId: member._id,
          username: member.username,
          name: member.name,
          balance: 0
        };
      }).filter(b => b !== null);
    } else {
      // Compute balances from matrix
      balances = trip.members.map((member, i) => {
        if (i === index) return null; // skip self
        return {
          userId: member._id,
          username: member.username,
          name: member.name,
          balance: trip.balanceMatrix[index][i], // balance w.rt this member
        };
      }).filter(b => b !== null);
    }

    res.status(200).json(balances);  // array of { userId, username, name, balance }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get trip-wise category expenses
exports.getTripCategoryExpenses = async (req, res) => {
  const { tripId } = req.params;
  try {
    const trip = await Trip.findById(tripId).select('members expenses').lean();
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (!isTripMember(trip, req.user.id)) {
      return res.status(403).json({ message: 'You are not part of this trip' });
    }

    let categoryTotals = {};
    let totalExpense = 0;

    trip.expenses.forEach(exp => {
      totalExpense += exp.amount;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categories = Object.keys(categoryTotals).map(category => ({
      category,
      amount: categoryTotals[category],
    }));

    return res.status(200).json({ totalExpense, categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get category-wise expenses for a user in a particular trip
exports.getUserCategoryExpensesInTrip = async (req, res) => {
  const { tripId} = req.params;
  const userId=req.user.id;
  try {
    const trip = await Trip.findById(tripId).select('members expenses').lean();
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (!isTripMember(trip, userId)) {
      return res.status(403).json({ message: 'You are not part of this trip' });
    }

    let categoryTotals = {};
    let totalUserExpense = 0;

    trip.expenses.forEach(exp => {
      if (exp.splitBetween.some(u => u.equals(userId))) {
        const perShare = exp.amount / exp.splitBetween.length;
        totalUserExpense += perShare;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + perShare;
      }
    });

    const categories = Object.keys(categoryTotals).map(category => ({
      category,
      amount: categoryTotals[category],
    }));

    return res.status(200).json({ totalUserExpense, categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get trip expense summary by member
exports.getTripMembersExpenseSummary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId)
      .populate('members', 'username name')
      .lean();

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (!isTripMember(trip, req.user.id)) {
      return res.status(403).json({ message: "You are not part of this trip" });
    }

    // Prepare summary
    const summary = trip.members.map(member => {
      let total = 0;
      trip.expenses.forEach(expense => {
        if (expense.splitBetween.map(u => u.toString()).includes(member._id.toString())) {
          total += expense.amount / expense.splitBetween.length;
        }
      });
      return {
        memberId: member._id,
        memberName: member.name,
        totalExpenseByThatMember: total
      };
    });

    return res.status(200).json({
      tripTitle: trip.title,
      summary // [{ memberId, memberName, totalExpenseByThatMember }, ...]
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get total expense amount for a particular trip
exports.getTripTotalExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).select('title members expenses').lean();

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!isTripMember(trip, req.user.id)) {
      return res.status(403).json({ message: "You are not part of this trip" });
    }

    const totalExpense = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return res.status(200).json({ tripTitle: trip.title, totalExpense });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
