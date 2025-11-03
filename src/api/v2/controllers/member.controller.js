const mandalService = require('../../../domains/mandal/services/mandal.service');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const add = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const { userId } = req.body;
    const member = await mandalService.addMember(mandalId, userId);
    res.status(200).json({ success: true, data: member, message: 'Member added' });
  } catch (err) {
    logger.error('Error in member add controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const list = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const members = await mandalService.listMembers(mandalId);
    res.status(200).json({ success: true, data: members, message: 'Members retrieved' });
  } catch (err) {
    logger.error('Error in member list controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const remove = async (req, res, next) => {
  try {
    const { mandalId, userId } = req.params;
    await mandalService.removeMember(mandalId, userId);
    res.status(200).json({ success: true, data: null, message: 'Member removed' });
  } catch (err) {
    logger.error('Error in member remove controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

module.exports = { add, list, remove };