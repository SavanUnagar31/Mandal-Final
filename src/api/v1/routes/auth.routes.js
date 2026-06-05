const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { authLimiter, checkLoginLockout } = require('../middlewares/rateLimit.middleware');
const {
  checkMobileSchema,
  sendOtpSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  registerSchema,
  logoutSchema,
  refreshSchema
} = require('../validators/auth.validator');

router.post('/check-mobile', authLimiter, validate(checkMobileSchema), authController.checkMobile);
router.post('/send-otp', authLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/set-password', authLimiter, validate(setPasswordSchema), authController.setPassword);
router.post('/login', authLimiter, checkLoginLockout, validate(loginSchema), authController.login);
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', validate(logoutSchema), authController.logout);
router.post('/refresh', validate(refreshSchema), authController.refresh);

module.exports = router;