// Updated src/domains/auth/repositories/user.repository.js with logging and caching
const { User, Op } = require('../../../infrastructure/database/models/index');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');
const bcrypt = require('bcrypt');
const cacheService = require('../../../infrastructure/cache/cache.service');

const findByEmailOrMobile = async (email, mobile) => {
  try {
    if (email) {
      const cached = await cacheService.getUserByEmail(email);
      if (cached) return cached;
    }
    if (mobile) {
      const cached = await cacheService.getUserByMobile(mobile);
      if (cached) return cached;
    }

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
    if (user) {
      await cacheService.setUser(user.id, user.toJSON ? user.toJSON() : user);
    }
    return user;
  } catch (error) {
    logger.error('Error in findByEmailOrMobile', { error: error.message, stack: error.stack });
    throw error;
  }
};

const findByEmail = async (email) => {
  try {
    const cached = await cacheService.getUserByEmail(email);
    if (cached) return cached;

    const user = await User.findOne({ where: { email } });
    if (user) {
      await cacheService.setUser(user.id, user.toJSON ? user.toJSON() : user);
    }
    return user;
  } catch (error) {
    logger.error('Error in findByEmail', { error: error.message, stack: error.stack });
    throw error;
  }
};

const findByMobile = async (mobile) => {
  try {
    const cached = await cacheService.getUserByMobile(mobile);
    if (cached) return cached;

    const user = await User.findOne({ where: { mobile } });
    if (user) {
      await cacheService.setUser(user.id, user.toJSON ? user.toJSON() : user);
    }
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
    const user = await findById(id);
    const [updated] = await User.update(data, { where: { id } });
    if (!updated) throw new AppError(404, 'User not found');
    
    if (user) {
      await cacheService.invalidateUser(user);
    }
    if (data.mobile) await cacheService.invalidateUser({ id, mobile: data.mobile });
    if (data.email) await cacheService.invalidateUser({ id, email: data.email });

    return await findById(id);
  } catch (error) {
    logger.error('Error in update user', { error: error.message, stack: error.stack });
    throw error;
  }
};

const findById = async (id) => {
  try {
    const cached = await cacheService.getUser(id);
    if (cached) return cached;

    const user = await User.findByPk(id);
    if (user) {
      await cacheService.setUser(id, user.toJSON ? user.toJSON() : user);
    }
    return user;
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