const mandalService = require('../../../domains/mandal/services/mandal.service');
const AppError = require('../../../utils/error');

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    const mandal = await mandalService.create(data, userId);
    res.status(201).json({ success: true, data: mandal, message: 'Mandal created' });
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mandal = await mandalService.get(id);
    res.status(200).json({ success: true, data: mandal, message: 'Mandal retrieved' });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const mandal = await mandalService.update(id, data);
    res.status(200).json({ success: true, data: mandal, message: 'Mandal updated' });
  } catch (err) {
    next(err);
  }
};

const deleteMandal = async (req, res, next) => {
  try {
    const { id } = req.params;
    await mandalService.deleteMandal(id);
    res.status(200).json({ success: true, data: null, message: 'Mandal deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, get, update, deleteMandal };