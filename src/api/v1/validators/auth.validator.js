const Joi = require('joi');

const checkMobileSchema = Joi.object({
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  purpose: Joi.string().valid('login', 'register', 'forgot-password').required(),
});

const sendOtpSchema = Joi.object({
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  purpose: Joi.string().valid('login', 'register', 'forgot-password').required(),
});

const verifyOtpSchema = Joi.object({
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  purpose: Joi.string().valid('login', 'register', 'forgot-password').required(),
  otpRef: Joi.string().uuid().required(),
});

const setPasswordSchema = Joi.object({
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  otpToken: Joi.string().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  checkMobileSchema,
  sendOtpSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  registerSchema,
  logoutSchema
};