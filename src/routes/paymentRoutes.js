import express from 'express';
import {
  createPaymentIntent,
  handleWebhook,
  getPaymentDetails,
  getCustomerPayments
} from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validatePayment } from '../middlewares/validation.js';
import { paymentLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post('/create-payment-intent', authenticate, paymentLimiter, validatePayment, createPaymentIntent);
router.post('/webhook', handleWebhook);
router.get('/:paymentId', authenticate, getPaymentDetails);
router.get('/customer/:customerId', authenticate, getCustomerPayments);

export default router;