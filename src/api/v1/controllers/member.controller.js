const mandalService = require('../../../domains/mandal/services/mandal.service');
const AppError = require('../../../utils/error');

const add = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const { userId } = req.body;
    const member = await mandalService.addMember(mandalId, userId);
    res.status(200).json({ success: true, data: member, message: 'Member added' });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const members = await mandalService.listMembers(mandalId);
    res.status(200).json({ success: true, data: members, message: 'Members retrieved' });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { mandalId, userId } = req.params;
    await mandalService.removeMember(mandalId, userId);
    res.status(200).json({ success: true, data: null, message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { add, list, remove };