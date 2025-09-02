const mandalMemberRepo = require('../../../domains/mandal/repositories/mandalMember.repository');
const AppError = require('../../../utils/error');

module.exports = (requiredRole) => async (req, res, next) => {
  const mandalId = req.params.mandalId || req.params.id || req.body.mandalId;
  const userId = req.user.id;
  try {
    const role = await mandalMemberRepo.getRole(userId, mandalId);
    if (!role || role !== requiredRole) return next(new AppError(403, 'Forbidden: Insufficient role'));
    next();
  } catch (err) {
    next(new AppError(403, 'Forbidden: Role check failed'));
  }
};