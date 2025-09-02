const authService = require('../../../domains/auth/services/auth.service');
const AppError = require('../../../utils/error');

const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;
    const user = await authService.register({ name, email, mobile, password });
    res.status(201).json({ success: true, data: { userId: user.id }, message: 'Registration successful, verification code sent' });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await authService.verifyEmail(email, code);
    res.status(200).json({ success: true, data: user, message: 'Email verified' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.status(200).json({ success: true, data: { token }, message: 'Login successful' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, login };