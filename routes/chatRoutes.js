const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMessages } = require('../controllers/chatController');

router.get('/:otherUserId', auth, getMessages);

module.exports = router;