const loanService = require('../../../domains/finance/services/loan.service');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const requestLoan = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;
    const loan = await loanService.requestLoan(mandalId, userId, amount);
    res.status(201).json({ success: true, data: loan, message: 'Loan requested' });
  } catch (err) {
    logger.error('Error in loan request controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const approveLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { duration } = req.body;
    const loan = await loanService.approveLoan(loanId, duration);
    res.status(200).json({ success: true, data: loan, message: 'Loan approved' });
  } catch (err) {
    logger.error('Error in loan approve controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const repay = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { amount } = req.body;
    const repayment = await loanService.repay(loanId, amount);
    res.status(200).json({ success: true, data: repayment, message: 'Loan repayment processed' });
  } catch (err) {
    logger.error('Error in loan repay controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const list = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const loans = await loanService.list(mandalId);
    res.status(200).json({ success: true, data: loans, message: 'Loans retrieved' });
  } catch (err) {
    logger.error('Error in loan list controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

module.exports = { requestLoan, approveLoan, repay, list };