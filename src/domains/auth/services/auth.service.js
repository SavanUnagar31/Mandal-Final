const userRepo = require('../repositories/user.repository');
const emailService = require('./email.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../../config/environment.config');
const { client: redis } = require('../../../infrastructure/cache/redis.config');
const AppError = require('../../../utils/error');
const { USER_REGISTERED, USER_VERIFIED } = require('../../../events/events/user.events');
const eventEmitter = require('../../../events/eventEmitter');
const logger = require('../../../utils/logger');

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async ({ name, email, mobile, password }) => {
  try {
    const existingUser = await userRepo.findByEmailOrMobile(email, mobile);
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }
    const user = await userRepo.create({ name, email, mobile, password }); // Password is hashed in userRepo
    const verificationCode = generateVerificationCode();
    await emailService.sendVerification(email, verificationCode);
    await redis.set(`verify:${user.id}`, verificationCode, { EX: 3600 });
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
    await redis.set(`auth:${user.id}`, token, { EX: 3600 });
    eventEmitter.emit(USER_REGISTERED, user);
    logger.info('User registered successfully', { userId: user.id, email });
    return { id: user.id, email: user.email };
  } catch (error) {
    logger.error('Registration failed', { email, error: error.message, stack: error.stack });
    throw error;
  }
};

const verifyEmail = async (email, code) => {
  try {
    const user = await userRepo.findByEmail(email);
    console.log({user});
    if (!user) throw new AppError(404, 'User not found');
    const storedCode = await redis.get(`verify:${user.id}`);
    if (storedCode !== code) throw new AppError(400, 'Invalid verification code');
    await userRepo.update(user.id, { verified: true });
    await redis.del(`verify:${user.id}`);
    eventEmitter.emit(USER_VERIFIED, user);
    logger.info('Email verified successfully', { userId: user.id, email });
    return user;
  } catch (error) {
    logger.error('Email verification failed', { email, error: error.message, stack: error.stack });
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const user = await userRepo.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Invalid credentials');
    }
    if (!user.verified) throw new AppError(403, 'Email not verified');
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    await redis.set(`auth:${user.id}`, token, { EX: 3600 });
    logger.info('User logged in successfully', { userId: user.id, email });
    return token;
  } catch (error) {
    logger.error('Login failed', { email, error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = { register, verifyEmail, login };