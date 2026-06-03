// Updated src/domains/auth/repositories/user.repository.js with logging
const { User, Op } = require('../../../infrastructure/database/models/index');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');
const bcrypt = require('bcrypt');

const findByEmailOrMobile = async (email, mobile) => {
  try {
    const where = {};
    if (email && mobile) {
      where[Op.or] = [{ email }, { mobile }];
    } else if (email) {
      where.email = email;
    } else if (mobile) {
      where.mobile = mobile;
    } else {
      return null;
    }
    const user = await User.findOne({ where });
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

const findByMobile = async (mobile) => {
  try {
    const user = await User.findOne({ where: { mobile } });
    return user;
  } catch (error) {
    logger.error('Error in findByMobile', { error: error.message, stack: error.stack });
    throw error;
  }
};

const create = async ({ name, email, mobile, password, address, latitude, longitude }) => {
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const user = await User.create({
      name,
      email: email || null,
      mobile,
      passwordHash: hashedPassword,
      isMobileVerified: false,
      isPasswordSet: !!password,
      status: 'ACTIVE',
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
    });
    logger.info('User created successfully', { userId: user.id, mobile });
    return user;
  } catch (error) {
    logger.error('Error creating user', { mobile, error: error.message, stack: error.stack });
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
  try {
    return await User.findByPk(id);
  } catch (error) {
    logger.error('Error in findById', { error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = {
  findByEmailOrMobile,
  findByEmail,
  findByMobile,
  create,
  update,
  findById,
};