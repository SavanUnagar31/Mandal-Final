const request = require('supertest');
const app = require('../../server'); // Updated path
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../src/config/environment.config');

describe('Finance API', () => {
  it('should process contribution payment', async () => {
    const token = jwt.sign({ id: 1 }, jwtSecret);
    const res = await request(app)
      .post('/api/v1/contributions/1/pay')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000 })
      .expect(200);
    expect(res.body.success).toBe(true);
  }, 10000);
});