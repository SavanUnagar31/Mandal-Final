// Updated src/domains/auth/repositories/user.repository.js with logging
const { User, Op } = require('../../../infrastructure/database/models/index');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');
const bcrypt = require('bcrypt');

const findByEmailOrMobile = async (email, mobile) => {
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { mobile }]
      },
    });
    return user;
  } catch (error) {
    logger.error('Error in findByEmailOrMobile', { error: error.message, stack: error.stack });
    throw error;
  }
};

const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user;
  } catch (error) {
    logger.error('Error in findByEmail', { error: error.message, stack: error.stack });
    throw error;
  }
};

const create = async ({ name, email, mobile, password }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const user = await User.create({ name, email, mobile, password: hashedPassword });
    logger.info('User created successfully', { userId: user.id, email });
    return user;
  } catch (error) {
    logger.error('Error creating user', { email, error: error.message, stack: error.stack });
    throw error;
  }
};

const update = async (id, data) => {
  try {
    const [updated] = await User.update(data, { where: { id } });
    if (!updated) throw new AppError(404, 'User not found');
    return await findById(id);
  } catch (error) {
    logger.error('Error in update user', { error: error.message, stack: error.stack });
    throw error;
  }
};

const findById = async (id) => {
  return await User.findByPk(id);
};

module.exports = { findByEmailOrMobile, findByEmail, create, update, findById };