const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../src/config/database.config');
const { client: redis, disconnect: disconnectRedis } = require('../../src/infrastructure/cache/redis.config');
const emailService = require('../../src/domains/auth/services/email.service');
const eventEmitter = require('../../../events/eventEmitter');
const bcrypt = require('bcrypt');

jest.mock('../../src/infrastructure/cache/redis.config', () => ({
  client: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn(),
  },
  disconnect: jest.fn().mockResolvedValue(),
}));
jest.mock('../../src/domains/auth/services/email.service', () => ({
  sendVerification: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../../events/eventEmitter', () => ({
  emit: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth API', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
    await disconnectRedis();
  });

  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', mobile: '1234567890', password: 'password' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBeDefined();
    expect(emailService.sendVerification).toHaveBeenCalledWith('test@example.com', expect.any(String));
    expect(redis.set).toHaveBeenCalledWith('verify:1', expect.any(String), { EX: 3600 });
    expect(redis.set).toHaveBeenCalledWith('auth:1', expect.any(String), { EX: 3600 });
    expect(eventEmitter.emit).toHaveBeenCalledWith('USER_REGISTERED', expect.any(Object));
  });

  it('should login a user', async () => {
    // First register a user
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', mobile: '1234567890', password: 'password' })
      .expect(201);

    // Verify email
    const user = await require('../../src/domains/auth/repositories/user.repository').findByEmail('test@example.com');
    await require('../../src/domains/auth/services/auth.service').verifyEmail('test@example.com', '123456');

    // Login
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  }, 10000);
});