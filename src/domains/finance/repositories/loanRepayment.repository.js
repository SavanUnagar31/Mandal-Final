const { LoanRepayment } = require('../../../infrastructure/database/models');
const logger = require('../../../utils/logger');

const create = async (data) => {
  try {
    const repayment = await LoanRepayment.create(data);
    logger.info('LoanRepayment repository create successful', { repaymentId: repayment.id });
    return repayment;
  } catch (err) {
    logger.error('Error in loanRepayment repository create', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create };