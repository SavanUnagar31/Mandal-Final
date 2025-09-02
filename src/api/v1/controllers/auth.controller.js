const authService = require('../../../domains/auth/services/auth.service');
const logger = require('../../../utils/logger');

const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;
    const user = await authService.register({ name, email, mobile, password });
    res.status(201).json({ success: true, data: { userId: user.id } });
  } catch (error) {
    logger.error('Registration error in controller', { error: error.message, stack: error.stack });
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await authService.verifyEmail(email, code);
    res.status(200).json({ success: true, data: { userId: user.id } });
  } catch (error) {
    logger.error('Email verification error in controller', { error: error.message, stack: error.stack });
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.status(200).json({ success: true, data: { token } });
  } catch (error) {
    logger.error('Login error in controller', { error: error.message, stack: error.stack });
    next(error);
  }
};

module.exports = { register, verifyEmail, login };