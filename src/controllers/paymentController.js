import { createPaymentIntentService, handleWebhookEvent, getPaymentDetailsService, getCustomerPaymentsService } from '../services/paymentService.js';

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
    const userId = req.user.id;

    const paymentIntent = await createPaymentIntentService(amount, currency, metadata, userId);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el pago'
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody;

    await handleWebhookEvent(rawBody, sig);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const paymentDetails = await getPaymentDetailsService(paymentId, userId);

    res.status(200).json({
      success: true,
      data: paymentDetails
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los detalles del pago'
    });
  }
};

export const getCustomerPayments = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario solo pueda acceder a sus propios pagos
    if (userId !== parseInt(customerId)) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para acceder a estos pagos'
      });
    }

    const payments = await getCustomerPaymentsService(customerId);

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error getting customer payments:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los pagos del cliente'
    });
  }
};