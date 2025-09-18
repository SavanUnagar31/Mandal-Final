const Loan = require('../entities/loan.entity');
const loanRepo = require('../repositories/loan.repository');
const loanRepaymentRepo = require('../repositories/loanRepayment.repository');
const mandalRepo = require('../../mandal/repositories/mandal.repository');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');
const { LOAN_REQUESTED, LOAN_APPROVED } = require('../../../events/events/loan.events');
const eventEmitter = require('../../../events/eventEmitter');

const requestLoan = async (mandalId, userId, amount) => {
  try {
    const mandal = await mandalRepo.findById(mandalId);
    if (!mandal) throw new AppError(404, 'Mandal not found');
    const loan = await loanRepo.create({ mandalId, userId, amount, status: 'requested' });
    eventEmitter.emit(LOAN_REQUESTED, new Loan(loan));
    logger.info('Loan requested successfully', { loanId: loan.id });
    return new Loan(loan);
  } catch (err) {
    logger.error('Error in request loan service', { error: err.message, stack: err.stack });
    throw err;
  }
};

const approveLoan = async (loanId, duration) => {
  try {
    const loan = await loanRepo.findById(loanId);
    if (!loan) throw new AppError(404, 'Loan not found');
    if (loan.status !== 'requested') throw new AppError(400, 'Loan not in requested state');
    const mandal = await mandalRepo.findById(loan.mandalId);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);
    const totalPayable = loan.amount + (loan.amount * mandal.interestRate / 100 * duration / 12);
    await loanRepo.update(loanId, {
      interestRate: mandal.interestRate,
      durationMonths: duration,
      startDate,
      endDate,
      totalPayable,
      status: 'approved',
    });
    const updatedLoan = await loanRepo.findById(loanId);
    eventEmitter.emit(LOAN_APPROVED, new Loan(updatedLoan));
    logger.info('Loan approved successfully', { loanId });
    return new Loan(updatedLoan);
  } catch (err) {
    logger.error('Error in approve loan service', { error: err.message, stack: err.stack });
    throw err;
  }
};

const repay = async (loanId, amount) => {
  try {
    const loan = await loanRepo.findById(loanId);
    if (!loan) throw new AppError(404, 'Loan not found');
    if (loan.status !== 'approved' && loan.status !== 'active') throw new AppError(400, 'Loan not active');
    const repaidAmount = (loan.repaidAmount || 0) + amount;
    const status = repaidAmount >= loan.totalPayable ? 'repaid' : 'active';
    await loanRepo.update(loanId, { repaidAmount, status });
    await loanRepaymentRepo.create({ loanId, amount, date: new Date(), type: 'principal' });
    const updatedLoan = await loanRepo.findById(loanId);
    logger.info('Loan repaid successfully', { loanId });
    return new Loan(updatedLoan);
  } catch (err) {
    logger.error('Error in repay loan service', { error: err.message, stack: err.stack });
    throw err;
  }
};

const list = async (mandalId) => {
  try {
    const loans = await loanRepo.list(mandalId);
    logger.info('Loans listed successfully', { mandalId });
    return loans;
  } catch (err) {
    logger.error('Error in list loans service', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { requestLoan, approveLoan, repay, list };