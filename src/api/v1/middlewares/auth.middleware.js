const jwt = require('jsonwebtoken');
const AppError = require('../../../utils/error');
const userRepo = require('../../../domains/auth/repositories/user.repository');
const { UserRole } = require('../../../infrastructure/database/models');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'No token provided', 'NO_TOKEN_PROVIDED'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Load full user from DB
    const user = await userRepo.findById(decoded.id);
    if (!user) {
      return next(new AppError(404, 'User not found', 'USER_NOT_FOUND'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new AppError(403, 'User is inactive or blocked', 'USER_INACTIVE'));
    }

    // Load roles
    const userRoles = await UserRole.findAll({ where: { userId: user.id } });
    const roles = userRoles.map(ur => ur.role);

    req.user = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      roles: roles
    };
    
    next();
  } catch (err) {
    next(new AppError(401, 'Invalid token', 'INVALID_TOKEN'));
  }
};