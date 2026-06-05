const authService = require('../../../domains/auth/services/auth.service');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');
const { recordFailedLogin, clearLoginLockout } = require('../middlewares/rateLimit.middleware');
const { recordAuditLog } = require('../../../utils/audit');

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
  const { mobile, password } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  try {
    const result = await authService.login(mobile, password);
    await clearLoginLockout(mobile, ip);
    
    // Audit Log success
    await recordAuditLog({
      userId: result.user.id,
      action: 'USER_LOGIN',
      details: { mobile },
      ipAddress: ip,
      result: 'SUCCESS',
    });

    logger.info('User logged in successfully', { mobile });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (err) {
    logger.error('Error in login controller', { error: err.message });
    
    // Audit Log failure
    await recordAuditLog({
      action: 'USER_LOGIN',
      details: { mobile, error: err.message },
      ipAddress: ip,
      result: 'FAILURE',
    });

    if (err.errorCode === 'INVALID_CREDENTIALS') {
      await recordFailedLogin(mobile, ip);
    }
    next(err);
  }
};

const register = async (req, res, next) => {
  const { name, mobile, email, address, latitude, longitude } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  try {
    const result = await authService.register({ name, mobile, email, address, latitude, longitude });
    
    // Audit Log success
    await recordAuditLog({
      userId: result.userId,
      action: 'USER_REGISTER',
      details: { name, mobile, email },
      ipAddress: ip,
      result: 'SUCCESS',
    });

    logger.info('User registered successfully', { mobile });
    res.status(201).json({
      success: true,
      message: 'Account created. OTP sent.',
      data: result
    });
  } catch (err) {
    logger.error('Error in register controller', { error: err.message });
    
    // Audit Log failure
    await recordAuditLog({
      action: 'USER_REGISTER',
      details: { name, mobile, email, error: err.message },
      ipAddress: ip,
      result: 'FAILURE',
    });
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
  const { refreshToken } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  try {
    const result = await authService.logout(refreshToken);
    
    // Audit Log success
    if (result.userId) {
      await recordAuditLog({
        userId: result.userId,
        action: 'USER_LOGOUT',
        details: {},
        ipAddress: ip,
        result: 'SUCCESS',
      });
    }

    logger.info('User logged in/out action completed');
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: result
    });
  } catch (err) {
    logger.error('Error in logout controller', { error: err.message });
    await recordAuditLog({
      action: 'USER_LOGOUT',
      details: { error: err.message },
      ipAddress: ip,
      result: 'FAILURE',
    });
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    logger.info('Tokens refreshed successfully');
    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: result
    });
  } catch (err) {
    logger.error('Error in refresh controller', { error: err.message });
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
  refresh,
};