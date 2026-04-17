const Message = require('../models/Message');
const getRoomId = require('../utils/getRoomId');

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    const roomId = getRoomId(userId, otherUserId);

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};