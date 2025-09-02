const authService = require('../../src/domains/auth/services/auth.service');
const userRepo = require('../../src/domains/auth/repositories/user.repository');
const emailService = require('../../src/domains/auth/services/email.service');
const redis = require('../../src/infrastructure/cache/redis.config');
const eventEmitter = require('../../../events/eventEmitter');
const bcrypt = require('bcrypt');

jest.mock('../../src/domains/auth/repositories/user.repository');
jest.mock('../../src/domains/auth/services/email.service');
jest.mock('../../src/infrastructure/cache/redis.config', () => ({
  client: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
  disconnect: jest.fn().mockResolvedValue(),
}));
jest.mock('../../../events/eventEmitter', () => ({
  emit: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    userRepo.findByEmailOrMobile.mockResolvedValue(null);
    userRepo.create.mockResolvedValue({ id: 1, email: 'test@example.com' });
    emailService.sendVerification.mockResolvedValue(true);
    redis.client.set.mockResolvedValue('OK');

    const result = await authService.register({
      name: 'Test',
      email: 'test@example.com',
      mobile: '1234567890',
      password: 'password',
    });

    expect(result.id).toBe(1);
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(emailService.sendVerification).toHaveBeenCalledWith('test@example.com', expect.any(String));
    expect(redis.client.set).toHaveBeenCalledWith('verify:1', expect.any(String), { EX: 3600 });
    expect(redis.client.set).toHaveBeenCalledWith('auth:1', expect.any(String), { EX: 3600 });
    expect(eventEmitter.emit).toHaveBeenCalledWith('USER_REGISTERED', expect.any(Object));
  });

  it('should verify email', async () => {
    userRepo.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com', verified: false });
    redis.client.get.mockResolvedValue('123456');
    userRepo.update.mockResolvedValue();
    redis.client.del.mockResolvedValue();
    const user = await authService.verifyEmail('test@example.com', '123456');
    expect(user.id).toBe(1);
    expect(userRepo.update).toHaveBeenCalledWith(1, { verified: true });
    expect(eventEmitter.emit).toHaveBeenCalledWith('USER_VERIFIED', expect.any(Object));
  });

  it('should login successfully', async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      verified: true,
    });
    bcrypt.compare.mockResolvedValue(true);
    redis.client.set.mockResolvedValue('OK');
    const token = await authService.login('test@example.com', 'password');
    expect(token).toBeDefined();
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(redis.client.set).toHaveBeenCalledWith('auth:1', expect.any(String), { EX: 3600 });
  });

  it('should fail login with invalid credentials', async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      verified: true,
    });
    bcrypt.compare.mockResolvedValue(false);
    await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  });
});