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
  disconnect: jest.fn().mockResolvedValue(),
}));

describe('Mandal API', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
    await disconnectRedis();
  });

  it('should create a mandal', async () => {
    const res = await request(app)
      .post('/api/v1/mandal')
      .send({ name: 'Test Mandal', description: 'Test Description' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mandalId).toBeDefined();
  }, 10000);
});