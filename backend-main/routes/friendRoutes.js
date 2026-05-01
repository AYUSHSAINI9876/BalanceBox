// routes/friendRoutes.js
const express = require('express');
const { sendRequest, getIncomingRequests, getOutgoingRequests, respondRequest } = require('../controllers/friendController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/send', protect, sendRequest);
router.get('/incoming', protect, getIncomingRequests);
router.get('/outgoing', protect, getOutgoingRequests);
router.put('/respond', protect, respondRequest);

module.exports = router;
