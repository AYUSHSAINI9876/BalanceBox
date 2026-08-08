// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FriendRequest = require('../models/FriendRequest');
const Trip = require('../models/Trip');
const { consumeSignupToken } = require('./otpController');

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



// Accounts can only be created with a signupToken, which is issued solely by
// verify-otp. That makes proof of email ownership a hard requirement.
exports.register = async (req, res) => {
  const { username, password, name, signupToken } = req.body;
  try {
    let email;
    try {
      email = consumeSignupToken(signupToken);
    } catch {
      return res.status(401).json({
        message: 'Email verification expired. Please verify your email again.',
        code: 'VERIFICATION_REQUIRED',
      });
    }

    const [byEmail, byUsername] = await Promise.all([
      User.findOne({ email }).select('_id').lean(),
      User.findOne({ username }).select('_id').lean(),
    ]);
    if (byEmail) return res.status(409).json({ message: 'That email already has an account.' });
    if (byUsername) return res.status(409).json({ message: 'Username already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed, name, emailVerified: true });
    await newUser.save();

    // Log the user straight in — they already proved ownership of the address.
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: newUser._id, username: newUser.username, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That email or username is already taken.' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, name: user.name, email: user.email },
    });
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

