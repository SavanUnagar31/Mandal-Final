const { Mandal } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');

const create = async (data) => Mandal.create(data);
const findById = async (id) => Mandal.findByPk(id);
const findByName = async (name) => Mandal.findOne({ where: { name } });
const update = async (id, data) => {
  const [updated] = await Mandal.update(data, { where: { id } });
  if (!updated) throw new AppError(404, 'Mandal not found');
  return Mandal.findByPk(id);
};
const deleteMandal = async (id) => {
  const deleted = await Mandal.destroy({ where: { id } });
  if (!deleted) throw new AppError(404, 'Mandal not found');
};

module.exports = { create, findById, findByName, update, deleteMandal };