const loanService = require('../../../domains/finance/services/loan.service');
const AppError = require('../../../utils/error');

const requestLoan = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;
    const loan = await loanService.requestLoan(mandalId, userId, amount);
    res.status(201).json({ success: true, data: loan, message: 'Loan requested' });
  } catch (err) {
    next(err);
  }
};

const approveLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { duration } = req.body;
    const loan = await loanService.approveLoan(loanId, duration);
    res.status(200).json({ success: true, data: loan, message: 'Loan approved' });
  } catch (err) {
    next(err);
  }
};

const repay = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { amount } = req.body;
    const repayment = await loanService.repay(loanId, amount);
    res.status(200).json({ success: true, data: repayment, message: 'Loan repayment processed' });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { mandalId } = req.params;
    const loans = await loanService.list(mandalId);
    res.status(200).json({ success: true, data: loans, message: 'Loans retrieved' });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestLoan, approveLoan, repay, list };