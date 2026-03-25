require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const connectDB = require('./config/db');
connectDB();

app.post('/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/paymentWebhook')
);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/payment', require('./routes/paymentRoute'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));