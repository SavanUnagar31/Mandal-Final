const request = require('supertest');
const app = require('../../server'); // Updated path
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../src/config/environment.config');

describe('E2E API', () => {
  it('should register and login', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', mobile: '1234567890', password: 'password' })
      .expect(201);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  }, 10000);
});