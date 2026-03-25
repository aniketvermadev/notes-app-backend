const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createPaymentIntent, getPayments } = require('../controllers/paymentController');

router.post('/create-payment-intent', auth, createPaymentIntent);
router.get('/payments', auth, getPayments);

module.exports = router;