const authService = require('../../../domains/auth/services/auth.service');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const checkMobile = async (req, res, next) => {
  try {
    const { mobile, purpose } = req.body;
    const result = await authService.checkMobile(mobile, purpose);
    logger.info('Mobile check completed successfully', { mobile, purpose });
    res.status(200).json({
      success: true,
      message: 'Mobile checked successfully',
      data: result
    });
  } catch (err) {
    logger.error('Error in checkMobile controller', { error: err.message });
    next(err);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { mobile, purpose } = req.body;
    const result = await authService.sendOtp(mobile, purpose);
    logger.info('OTP sent successfully', { mobile, purpose });
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: result
    });
  } catch (err) {
    logger.error('Error in sendOtp controller', { error: err.message });
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, purpose, otpRef } = req.body;
    const result = await authService.verifyOtp(mobile, otp, purpose, otpRef);
    logger.info('OTP verified successfully', { mobile, purpose, otpRef });
    res.status(200).json({
      success: true,
      message: 'OTP verified',
      data: result
    });
  } catch (err) {
    logger.error('Error in verifyOtp controller', { error: err.message });
    next(err);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const { mobile, otpToken, password, confirmPassword } = req.body;
    const result = await authService.setPassword(mobile, otpToken, password, confirmPassword);
    logger.info('Password set successfully', { mobile });
    res.status(200).json({
      success: true,
      message: 'Password set successfully',
      data: result
    });
  } catch (err) {
    logger.error('Error in setPassword controller', { error: err.message });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    const result = await authService.login(mobile, password);
    logger.info('User logged in successfully', { mobile });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (err) {
    logger.error('Error in login controller', { error: err.message });
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, mobile, email, address, latitude, longitude } = req.body;
    const result = await authService.register({ name, mobile, email, address, latitude, longitude });
    logger.info('User registered successfully', { mobile });
    res.status(201).json({
      success: true,
      message: 'Account created. OTP sent.',
      data: result
    });
  } catch (err) {
    logger.error('Error in register controller', { error: err.message });
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await authService.me(req.user.id);
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: result
    });
  } catch (err) {
    logger.error('Error in me controller', { error: err.message });
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    logger.info('User logged out successfully');
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: result
    });
  } catch (err) {
    logger.error('Error in logout controller', { error: err.message });
    next(err);
  }
};

module.exports = {
  checkMobile,
  sendOtp,
  verifyOtp,
  setPassword,
  login,
  register,
  me,
  logout,
};