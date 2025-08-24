// tests/payment.test.js
const request = require('supertest');
const app = require('../app');
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

describe('Payment System', () => {
  test('Create payment intent', async () => {
    const response = await request(app)
      .post('/api/payments/create-payment-intent')
      .set('Authorization', 'Bearer test-token')
      .send({ amount: 1000, currency: 'eur' });
    
    expect(response.status).toBe(200);
    expect(response.body.clientSecret).toBeDefined();
  });
  
  // Más tests...
});