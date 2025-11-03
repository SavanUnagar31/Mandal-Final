require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  twilioSid: process.env.TWILIO_SID,
  twilioToken: process.env.TWILIO_TOKEN,
  twilioPhone: process.env.TWILIO_PHONE,
  redisUrl: process.env.REDIS_URL,
};