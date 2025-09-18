const authService = require('../../../domains/auth/services/auth.service');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const register = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await authService.register(data);
    logger.info('User registered successfully', { userId: user.id });
    res.status(201).json({ success: true, data: { userId: user.id }, message: 'User registered' });
  } catch (err) {
    logger.error('Error in auth register controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    logger.info('User logged in successfully', { email });
    res.status(200).json({ success: true, data: { token }, message: 'Login successful' });
  } catch (err) {
    logger.error('Error in auth login controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await authService.verifyEmail(email, code);
    logger.info('Email verified successfully', { userId: user.id });
    res.status(200).json({ success: true, data: { userId: user.id }, message: 'Email verified' });
  } catch (err) {
    logger.error('Error in auth verifyEmail controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

module.exports = { register, login, verifyEmail };