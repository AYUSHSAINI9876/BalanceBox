// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FriendRequest = require('../models/FriendRequest');
const Trip = require('../models/Trip');

exports.getFriendsBalances = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all accepted friendships
    const acceptedRequests = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }).select('sender receiver').lean();

    // Get all friendIds
    const friendIds = acceptedRequests.map(fr => {
      return fr.sender.toString() === userId ? fr.receiver.toString() : fr.sender.toString();
    });

    // Fetch all trips that involve this user
    const trips = await Trip.find({ members: userId }).select('members balanceMatrix').lean();

    const balanceMap = {}; // { friendId: totalBalance }
    trips.forEach(trip => {
      const myIndex = trip.members.findIndex(m => m.toString() === userId);
      // A trip with no expenses yet can have an empty/stale matrix.
      const myRow = trip.balanceMatrix?.[myIndex];
      if (myIndex === -1 || !myRow) return;

      trip.members.forEach((memberId, memberIdx) => {
        const memberIdStr = memberId.toString();
        if (memberIdx !== myIndex && friendIds.includes(memberIdStr)) {
          balanceMap[memberIdStr] = (balanceMap[memberIdStr] || 0) + (myRow[memberIdx] || 0);
        }
      });
    });

    // Fetch friend names
    const friends = await User.find({ _id: { $in: friendIds } }, 'name username').lean();
    const result = friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      username: friend.username,
      balance: balanceMap[friend._id.toString()] || 0,
    }));

    return res.status(200).json(result); // [{ id, name, username, balance }]
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



exports.register = async (req, res) => {
  const { username, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed, name });

    await newUser.save();
    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser._id, username: newUser.username, name: newUser.name },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Everything the Home dashboard needs, derived from a single pass over the user's trips.
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [trips, totalFriends] = await Promise.all([
      Trip.find({ members: userId })
        .select('title expenses createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      FriendRequest.countDocuments({
        status: 'accepted',
        $or: [{ sender: userId }, { receiver: userId }],
      }),
    ]);

    const categorySummary = {};
    let totalExpense = 0;

    const perTripUserTotals = trips.map(trip => {
      let tripUserTotal = 0;
      for (const expense of trip.expenses) {
        const isSplitWithUser = expense.splitBetween.some(u => u.toString() === userId);
        if (!isSplitWithUser) continue;
        const share = expense.amount / expense.splitBetween.length;
        tripUserTotal += share;
        categorySummary[expense.category] = (categorySummary[expense.category] || 0) + share;
      }
      totalExpense += tripUserTotal;
      return {
        tripId: trip._id,
        tripTitle: trip.title,
        totalUserExpense: tripUserTotal,
      };
    });

    res.status(200).json({
      totalTrips: trips.length,
      totalFriends,
      totalExpense,
      categorySummary,
      recentTrips: perTripUserTotals.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

