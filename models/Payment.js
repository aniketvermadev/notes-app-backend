const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  currency: String,
  status: { type: String, default: 'pending' },
  stripePaymentIntentId: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);