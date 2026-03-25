const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    // total payment count
    const total = await Payment.countDocuments({ user: req.user.id });

    // paginated notes
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!payments.length) {
      return res.status(404).json({ msg: 'No payments found' });
    }

    res.json({
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ NEVER trust frontend amount
    const amount = 50000; // ₹500 fixed (example)

    // 1. Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    // 2. Save in DB
    const payment = await Payment.create({
      user: userId,
      amount,
      currency: 'inr',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id
    });

    // 3. Send client secret
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};