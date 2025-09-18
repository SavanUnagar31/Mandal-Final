const Razorpay = require('razorpay');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (amount) => {
  try {
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await instance.orders.create(options);
    logger.info('Payment order created successfully', { orderId: order.id });
    return order;
  } catch (err) {
    logger.error('Error in payment service createOrder', { error: err.message, stack: err.stack });
    throw new AppError(500, 'Failed to create payment order');
  }
};

module.exports = { createOrder };