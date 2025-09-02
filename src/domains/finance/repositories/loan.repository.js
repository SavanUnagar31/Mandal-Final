const { Loan } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');

const create = async (data) => Loan.create(data);
const findById = async (id) => Loan.findByPk(id);
const update = async (id, data) => {
  const [updated] = await Loan.update(data, { where: { id } });
  if (!updated) throw new AppError(404, 'Loan not found');
  return Loan.findByPk(id);
};
const list = async (mandalId) => Loan.findAll({ where: { mandalId } });

module.exports = { create, findById, update, list };