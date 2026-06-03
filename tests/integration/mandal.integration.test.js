// Mandal-Final/tests/integration/mandal.integration.test.js
const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../src/config/database.config');
const { client: redis, disconnect: disconnectRedis } = require('../../src/infrastructure/cache/redis.config');

jest.mock('../../src/infrastructure/cache/redis.config', () => ({
  client: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn(),
  },
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
}));

describe('Mandal API', () => {
  let token;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const { User, UserRole } = require('../../src/infrastructure/database/models');
    const user = await User.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Mandal Creator',
      mobile: '7777777777',
      status: 'ACTIVE',
      is_mobile_verified: true,
      is_password_set: true
    });

    await UserRole.create({
      userId: user.id,
      role: 'MANDAL_OWNER'
    });

    const jwt = require('jsonwebtoken');
    const { jwtSecret } = require('../../src/config/environment.config');
    token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close();
    await disconnectRedis();
  });

  it('should create a mandal', async () => {
    const res = await request(app)
      .post('/api/v1/mandals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Mandal',
        contributionMode: 'monthly',
        contributionAmount: 1000,
        interestRate: 5
      })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mandalId).toBeDefined();
  }, 10000);
});