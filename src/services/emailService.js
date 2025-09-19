import nodemailer from 'nodemailer';

// Configurar el transporter de Nodemailer
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // Contraseña de aplicación de Gmail
    },
  });
};

// Función para enviar correo de confirmación al cliente
export const sendConfirmationEmail = async (customerEmail, order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Confirmación de Pedido - ${order.orderId}`,
      html: generateOrderConfirmationHTML(order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de confirmación enviado a: ${customerEmail}`);
  } catch (error) {
    console.error('Error enviando correo de confirmación:', error);
    throw error;
  }
};

// Función para enviar notificación al dueño
export const sendOwnerNotification = async (ownerEmail, order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: `Nuevo Pedido Recibido - ${order.orderId}`,
      html: generateOwnerNotificationHTML(order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notificación enviada al dueño: ${ownerEmail}`);
  } catch (error) {
    console.error('Error enviando notificación al dueño:', error);
    throw error;
  }
};

// Plantilla HTML para el cliente
const generateOrderConfirmationHTML = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #047857; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; }
        .order-details { margin: 20px 0; }
        .product { border-bottom: 1px solid #ddd; padding: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Gracias por tu compra!</h1>
        </div>
        
        <div class="content">
          <p>Hola,</p>
          <p>Hemos recibido tu pedido correctamente. Aquí tienes los detalles:</p>
          
          <div class="order-details">
            <h2>Detalles del Pedido #${order.orderId}</h2>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            <p><strong>Total:</strong> €${order.amount.toFixed(2)}</p>
            <p><strong>Estado:</strong> Confirmado</p>
          </div>
          
          <p>Te mantendremos informado sobre el estado de tu pedido.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        
        <div class="footer">
          <p>Joyería Artesanal</p>
          <p>© ${new Date().getFullYear()} - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plantilla HTML para el dueño
const generateOwnerNotificationHTML = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; }
        .order-details { margin: 20px 0; }
        .urgent { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Nuevo Pedido Recibido!</h1>
        </div>
        
        <div class="content">
          <p class="urgent">Tienes un nuevo pedido que requiere atención.</p>
          
          <div class="order-details">
            <h2>Detalles del Pedido #${order.orderId}</h2>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            <p><strong>Total:</strong> €${order.amount.toFixed(2)}</p>
            <p><strong>ID de Pago:</strong> ${order.paymentId}</p>
            <p><strong>Cliente ID:</strong> ${order.userId}</p>
          </div>
          
          <p>Por favor, procesa este pedido lo antes posible.</p>
        </div>
        
        <div class="footer">
          <p>Sistema de Notificaciones - Joyería Artesanal</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default {
  sendConfirmationEmail,
  sendOwnerNotification
};