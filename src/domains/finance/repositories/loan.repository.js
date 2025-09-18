const { Loan } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');

const create = async (data) => {
  try {
    const loan = await Loan.create(data);
    logger.info('Loan repository create successful', { loanId: loan.id });
    return loan;
  } catch (err) {
    logger.error('Error in loan repository create', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findById = async (id) => {
  try {
    const loan = await Loan.findByPk(id);
    if (!loan) throw new AppError(404, 'Loan not found');
    logger.info('Loan repository findById successful', { id });
    return loan;
  } catch (err) {
    logger.error('Error in loan repository findById', { error: err.message, stack: err.stack });
    throw err;
  }
};

const update = async (id, data) => {
  try {
    const [updated] = await Loan.update(data, { where: { id } });
    if (!updated) throw new AppError(404, 'Loan not found');
    logger.info('Loan repository update successful', { id });
    return await findById(id);
  } catch (err) {
    logger.error('Error in loan repository update', { error: err.message, stack: err.stack });
    throw err;
  }
};

const list = async (mandalId) => {
  try {
    const loans = await Loan.findAll({ where: { mandalId } });
    logger.info('Loan repository list successful', { mandalId });
    return loans;
  } catch (err) {
    logger.error('Error in loan repository list', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create, findById, update, list };