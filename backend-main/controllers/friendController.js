
// controllers/friendRequestController.js
const User = require('../models/User'); 
const FriendRequest = require('../models/FriendRequest');

exports.sendRequest = async (req, res) => {
  const { username } = req.body; // receiver's username
  
  try {
    // 1️⃣ Find receiver by username
    const receiver = await User.findOne({ username });
    if (!receiver) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // 2️⃣ Check if already friends (status: accepted)
    const alreadyFriends = await FriendRequest.findOne({ 
      $or: [
        { sender: req.user.id, receiver: receiver._id, status: 'accepted' },
        { sender: receiver._id, receiver: req.user.id, status: 'accepted' }
      ]
    });
    if (alreadyFriends) {
      return res.status(400).json({ message: 'You are already friends!' });
    }

    // 3️⃣ Check if receiver already sent you a request (status: pending)
    const reverseRequest = await FriendRequest.findOne({ 
      sender: receiver._id, 
      receiver: req.user.id,
      status: 'pending'
    });

    if (reverseRequest) {
      // Accept the existing request
      reverseRequest.status = 'accepted';
      await reverseRequest.save();
      return res.status(200).json({ message: 'Friend request accepted! You are now friends!' });
    }

    // 4️⃣ Check if you already sent a request
    const existingRequest = await FriendRequest.findOne({ sender: req.user.id, receiver: receiver._id, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent!' });
    }

    // 5️⃣ Create a new friend request
    await FriendRequest.create({ sender: req.user.id, receiver: receiver._id, status: 'pending' });
    return res.status(201).json({ message: 'Friend request sent successfully!' });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get incoming friend requests
exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', 'username name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get outgoing friend requests
exports.getOutgoingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ sender: req.user.id, status: 'pending' })
      .populate('receiver', 'username name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept or Decline friend request
exports.respondRequest = async (req, res) => {
  const { requestId, action } = req.body; // action: 'accepted' or 'declined'
  try {
    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Ensure receiver is the one responding
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond' });
    }

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accepted' or 'declined'" });
    }

    // Update status
    request.status = action;
    await request.save();

    return res.status(200).json({ message: `Request ${action} successfully!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
