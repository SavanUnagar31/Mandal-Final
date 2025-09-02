const Loan = require('../entities/loan.entity');
const loanRepo = require('../repositories/loan.repository');
const loanRepaymentRepo = require('../repositories/loanRepayment.repository');
const mandalRepo = require('../../mandal/repositories/mandal.repository');
const AppError = require('../../../utils/error');
const { LOAN_REQUESTED, LOAN_APPROVED } = require('../../../events/events/loan.events');
const eventEmitter = require('../../../events/eventEmitter');

const requestLoan = async (mandalId, userId, amount) => {
  const mandal = await mandalRepo.findById(mandalId);
  if (!mandal) throw new AppError(404, 'Mandal not found');
  const loan = await loanRepo.create({ mandalId, userId, amount, status: 'requested' });
  eventEmitter.emit(LOAN_REQUESTED, new Loan(loan));
  return new Loan(loan);
};

const approveLoan = async (loanId, duration) => {
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
  return new Loan(updatedLoan);
};

const repay = async (loanId, amount) => {
  const loan = await loanRepo.findById(loanId);
  if (!loan) throw new AppError(404, 'Loan not found');
  if (loan.status !== 'approved' && loan.status !== 'active') throw new AppError(400, 'Loan not active');
  const repaidAmount = (loan.repaidAmount || 0) + amount;
  const status = repaidAmount >= loan.totalPayable ? 'repaid' : 'active';
  await loanRepo.update(loanId, { repaidAmount, status });
  await loanRepaymentRepo.create({ loanId, amount, date: new Date(), type: 'principal' });
  const updatedLoan = await loanRepo.findById(loanId);
  return new Loan(updatedLoan);
};

const list = async (mandalId) => {
  await mandalRepo.findById(mandalId);
  const loans = await loanRepo.list(mandalId);
  return loans.map(l => new Loan(l));
};

module.exports = { requestLoan, approveLoan, repay, list };