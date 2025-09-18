const mandalService = require('../../../domains/mandal/services/mandal.service');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    const mandal = await mandalService.create(data, userId);
    res.status(201).json({ success: true, data: mandal, message: 'Mandal created' });
  } catch (err) {
    logger.error('Error in mandal create controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mandal = await mandalService.get(id);
    res.status(200).json({ success: true, data: mandal, message: 'Mandal retrieved' });
  } catch (err) {
    logger.error('Error in mandal get controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const mandal = await mandalService.update(id, data);
    res.status(200).json({ success: true, data: mandal, message: 'Mandal updated' });
  } catch (err) {
    logger.error('Error in mandal update controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

const deleteMandal = async (req, res, next) => {
  try {
    const { id } = req.params;
    await mandalService.delete(id);
    res.status(200).json({ success: true, data: null, message: 'Mandal deleted' });
  } catch (err) {
    logger.error('Error in mandal delete controller', { error: err.message, stack: err.stack });
    next(new AppError(err.statusCode || 500, err.message));
  }
};

module.exports = { create, get, update, deleteMandal };