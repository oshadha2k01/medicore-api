process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');

describe('API Gateway', () => {
  test('GET /health returns 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.gateway).toBe('healthy');
  });

  test('POST /auth/token returns JWT for valid admin credentials', async () => {
    const response = await request(app)
      .post('/auth/token')
      .send({ username: 'admin', password: process.env.ADMIN_PASSWORD || 'admin123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.role).toBe('ADMIN');
  });

  test('GET /api/patients requires authorization', async () => {
    const response = await request(app).get('/api/patients');
    expect(response.statusCode).toBe(401);
  });
});
