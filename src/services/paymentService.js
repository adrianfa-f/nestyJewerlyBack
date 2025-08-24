import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db.js';
/* import { sendConfirmationEmail } from './emailService.js'; */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntentService = async (amount, currency, metadata, userId) => {
  try {
    // Validar que el monto sea válido (mínimo 1€)
    if (amount < 100) {
      throw new Error('El monto debe ser de al menos 1€ (100 céntimos)');
    }

    // Crear una orden en la base de datos
    const orderId = uuidv4();
    const order = await prisma.order.create({
      data: {
        orderId,
        userId,
        amount: amount / 100, // Convertir a euros
        currency: currency || 'eur',
        status: 'pending',
        metadata: metadata || {}
      }
    });

    // Crear el intento de pago en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'eur',
      metadata: {
        orderId,
        userId: userId.toString(),
        ...metadata
      },
      payment_method_types: ['card'],
      description: `Compra en Joyería Artesanal - Orden ${orderId}`,
    });

    console.log(`Payment intent created: ${paymentIntent.id} for order: ${orderId}`);

    return paymentIntent;
  } catch (error) {
    console.error('Error in createPaymentIntentService:', error);
    throw error;
  }
};

export const handleWebhookEvent = async (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw new Error(`Firma de webhook inválida: ${err.message}`);
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const { orderId, userId } = paymentIntent.metadata;

    // Actualizar la orden en la base de datos
    const order = await prisma.order.update({
      where: { orderId },
      data: {
        status: 'completed',
        paymentId: paymentIntent.id,
        paidAt: new Date()
      },
      include: {
        user: true
      }
    });

    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Enviar email de confirmación
    /* await sendConfirmationEmail(order.user.email, order); */

    console.log(`Payment succeeded for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;

    // Actualizar la orden en la base de datos
    await prisma.order.update({
      where: { orderId },
      data: {
        status: 'failed',
        paymentId: paymentIntent.id,
        errorMessage: paymentIntent.last_payment_error?.message || 'Pago fallido'
      }
    });

    console.log(`Payment failed for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

const handleChargeRefunded = async (charge) => {
  try {
    const paymentIntentId = charge.payment_intent;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { orderId } = paymentIntent.metadata;

    // Actualizar la orden en la base de datos
    await prisma.order.update({
      where: { orderId },
      data: {
        status: 'refunded',
        refundedAt: new Date()
      }
    });

    console.log(`Payment refunded for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling refund:', error);
  }
};

export const getPaymentDetailsService = async (paymentId, userId) => {
  try {
    // Recuperar el pago de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    // Verificar que el usuario tenga acceso a este pago
    if (paymentIntent.metadata.userId !== userId.toString()) {
      throw new Error('No autorizado para ver este pago');
    }

    // Recuperar la orden de la base de datos
    const order = await prisma.order.findUnique({
      where: { orderId: paymentIntent.metadata.orderId }
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    return {
      paymentIntent,
      order
    };
  } catch (error) {
    console.error('Error in getPaymentDetailsService:', error);
    throw error;
  }
};

export const getCustomerPaymentsService = async (customerId) => {
  try {
    // Buscar todas las órdenes del cliente
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(customerId) },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limitar a las 50 órdenes más recientes
    });

    return orders;
  } catch (error) {
    console.error('Error in getCustomerPaymentsService:', error);
    throw error;
  }
};