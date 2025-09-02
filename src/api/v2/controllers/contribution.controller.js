const contributionService = require('../../../domains/finance/services/contribution.service');
const AppError = require('../../../utils/error');

const pay = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;
    const payment = await contributionService.pay(mandalId, userId, amount);
    res.status(200).json({ success: true, data: payment, message: 'Contribution paid' });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const userId = req.user.id;
    const contributions = await contributionService.list(mandalId, userId);
    res.status(200).json({ success: true, data: contributions, message: 'Contributions retrieved' });
  } catch (err) {
    next(err);
  }
};

module.exports = { pay, list };