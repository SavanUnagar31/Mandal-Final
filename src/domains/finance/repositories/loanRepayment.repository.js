const { LoanRepayment } = require('../../../infrastructure/database/models');

const create = async (data) => LoanRepayment.create(data);

module.exports = { create };