const jwt = require('jsonwebtoken');
const AppError = require('../../../utils/error');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'No token provided'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError(401, 'Invalid token'));
  }
};