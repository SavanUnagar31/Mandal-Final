const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  checkMobileSchema,
  sendOtpSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  registerSchema,
  logoutSchema
} = require('../validators/auth.validator');

router.post('/check-mobile', validate(checkMobileSchema), authController.checkMobile);
router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/set-password', validate(setPasswordSchema), authController.setPassword);
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', validate(logoutSchema), authController.logout);

module.exports = router;