// Mandal-Final/src/infrastructure/external/payment.provider.js
const Razorpay = require('razorpay');

let razorpay;
if (process.env.NODE_ENV !== 'test') {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  }
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  razorpay = {}; // Empty object for test environment
}

const createOrder = async (amount, currency = 'INR') => {
  if (process.env.NODE_ENV === 'test') {
    return { id: 'order_123', amount: amount * 100, currency }; // Mock response for tests
  }
  return razorpay.orders.create({ amount: amount * 100, currency });
};

module.exports = { createOrder };