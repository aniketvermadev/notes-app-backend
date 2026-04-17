require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = 'https://notes-app-frontend-swart-two.vercel.app';

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connectDB = require('./config/db');
connectDB();

app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/paymentWebhook')
);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/payment', require('./routes/paymentRoute'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const Message = require('./models/Message');
const getRoomId = require('./utils/getRoomId');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_chat', ({ userId, otherUserId }) => {
    const roomId = getRoomId(userId, otherUserId);
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { sender, receiver, text } = data;

      const roomId = getRoomId(sender, receiver);

      const message = await Message.create({
        roomId,
        sender,
        receiver,
        text,
      });

      io.to(roomId).emit('receive_message', message);
    } catch (error) {
      console.log('Socket message error:', error.message);
    }
  });

  socket.on('typing', ({ sender, receiver }) => {
    const roomId = getRoomId(sender, receiver);

    socket.to(roomId).emit('typing', {
      sender,
    });
  });

  socket.on('stop_typing', ({ sender, receiver }) => {
    const roomId = getRoomId(sender, receiver);

    socket.to(roomId).emit('stop_typing', {
      sender,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));