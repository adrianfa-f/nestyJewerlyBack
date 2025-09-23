// services/emailService.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Template para cancelación automática
const getAutoCancelTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pedido Cancelado Automáticamente</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${order.customerName}</strong>,</p>
            <p>Lamentamos informarte que tu pedido ha sido cancelado automáticamente por falta de pago después de 24 horas.</p>
            
            <div class="order-details">
                <h3>Detalles del Pedido #${order.orderNumber}</h3>
                <p><strong>Fecha del Pedido:</strong> ${new Date(
                  order.createdAt
                ).toLocaleDateString("es-ES")}</p>
                <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
                <p><strong>Razón:</strong> No se recibió el pago dentro del plazo establecido</p>
            </div>

            <p>Si ya realizaste el pago o deseas realizar un nuevo pedido, por favor contáctanos.</p>
        </div>
        <div class="footer">
            <p>NestyPasto - Delicias artesanales</p>
        </div>
    </div>
</body>
</html>
`;

// Template para notificación al admin de cancelación automática
const getAdminAutoCancelTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .order-alert { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pedido Cancelado Automáticamente</h1>
        </div>
        <div class="content">
            <div class="order-alert">
                <h3>Pedido #${order.orderNumber} - Cancelado por Sistema</h3>
                <p><strong>Cliente:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
                <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
                <p><strong>Fecha del Pedido:</strong> ${new Date(
                  order.createdAt
                ).toLocaleDateString("es-ES")}</p>
                <p><strong>Razón:</strong> No se recibió pago en 24 horas</p>
            </div>

            <p>Este pedido fue cancelado automáticamente por el sistema.</p>
        </div>
        <div class="footer">
            <p>NestyPasto - Sistema de Notificaciones</p>
        </div>
    </div>
</body>
</html>
`;

// Template para confirmación de pedido al cliente (actualizado)
const getOrderConfirmationTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Pedido Confirmado!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${order.customerName}</strong>,</p>
            <p>Hemos recibido tu pedido correctamente. Aquí tienes los detalles:</p>
            
            <div class="order-details">
                <h3>Detalles del Pedido #${order.orderNumber}</h3>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                  "es-ES"
                )}</p>
                <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
                <p><strong>Estado:</strong> Pendiente de pago</p>
            </div>

            <div class="warning">
                <h4>⚠️ Importante: Plazo de Pago</h4>
                <p>Tienes <strong>24 horas</strong> para realizar el pago. Pasado este tiempo, el pedido será cancelado automáticamente.</p>
            </div>

            <h4>Productos:</h4>
            ${order.items
              .map(
                (item) => `
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>€${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `
              )
              .join("")}

            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 5px;">
                <h4>Instrucciones de Pago:</h4>
                <p>Realiza el pago mediante Bizum al número: <strong>+34 123 456 789</strong></p>
                <p><strong>Importante:</strong> Incluye el número de pedido <strong>${
                  order.orderNumber
                }</strong> en el concepto.</p>
            </div>
        </div>
        <div class="footer">
            <p>NestyPasto - Delicias artesanales</p>
            <p>Si tienes alguna pregunta, contáctanos respondiendo a este email.</p>
        </div>
    </div>
</body>
</html>
`;

// Template para notificación de cambio de estado (mantener igual)
const getStatusUpdateTemplate = (order, newStatus) => {
  const statusMessages = {
    paid: {
      subject: "¡Pago Confirmado!",
      title: "Pago Confirmado",
      message: "Hemos confirmado tu pago y estamos preparando tu pedido.",
    },
    shipped: {
      subject: "¡Pedido Enviado!",
      title: "Pedido Enviado",
      message: "Tu pedido ha sido enviado y está en camino.",
    },
    completed: {
      subject: "¡Pedido Entregado!",
      title: "Pedido Completado",
      message: "Tu pedido ha sido entregado satisfactoriamente.",
    },
    cancelled: {
      subject: "Estado de tu Pedido",
      title: "Pedido Cancelado",
      message: "Lamentamos informarte que tu pedido ha sido cancelado.",
    },
  };

  const statusInfo = statusMessages[newStatus] || {
    subject: "Actualización de Pedido",
    title: "Estado Actualizado",
    message: `El estado de tu pedido ha cambiado a: ${newStatus}`,
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .status-update { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${statusInfo.title}</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${order.customerName}</strong>,</p>
            <p>${statusInfo.message}</p>
            
            <div class="status-update">
                <h3>Pedido #${order.orderNumber}</h3>
                <p><strong>Nuevo Estado:</strong> ${newStatus}</p>
                <p><strong>Fecha de Actualización:</strong> ${new Date().toLocaleDateString(
                  "es-ES"
                )}</p>
            </div>

            <p>Puedes ver el estado actualizado de tu pedido en cualquier momento visitando nuestra página.</p>
        </div>
        <div class="footer">
            <p>NestyPasto - Delicias artesanales</p>
        </div>
    </div>
</body>
</html>
`;
};

// Template para notificación al admin de nueva orden (mantener igual)
const getAdminNotificationTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .order-alert { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ef4444; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Nuevo Pedido Recibido!</h1>
        </div>
        <div class="content">
            <div class="order-alert">
                <h3>Pedido #${order.orderNumber}</h3>
                <p><strong>Cliente:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
                <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                  "es-ES"
                )}</p>
            </div>

            <p>Accede al panel de administración para gestionar este pedido.</p>
            <a href="https://nestypasto.netlify.app/admin/orders" 
               style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">
               Ver Pedido
            </a>
        </div>
        <div class="footer">
            <p>NestyPasto - Sistema de Notificaciones</p>
        </div>
    </div>
</body>
</html>
`;

// Función para enviar cancelación automática
export const sendAutoCancelNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@nestypasto.com";

  try {
    // Enviar al cliente
    await resend.emails.send({
      from: "NestyPasto <notificaciones@nestypasto.netlify.app>",
      to: [order.customerEmail],
      subject: `Pedido Cancelado #${order.orderNumber}`,
      html: getAutoCancelTemplate(order),
    });

    // Enviar al admin
    await resend.emails.send({
      from: "NestyPasto <notificaciones@nestypasto.netlify.app>",
      to: [adminEmail],
      subject: `Pedido Cancelado Automáticamente #${order.orderNumber}`,
      html: getAdminAutoCancelTemplate(order),
    });

    console.log("Notificaciones de cancelación automática enviadas");
    return true;
  } catch (error) {
    console.error("Error enviando notificaciones de cancelación:", error);
    return false;
  }
};

// Mantener las funciones existentes
export const sendOrderConfirmation = async (order) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "NestyPasto <notificaciones@nestypasto.netlify.app>",
      to: [order.customerEmail],
      subject: `Confirmación de Pedido #${order.orderNumber}`,
      html: getOrderConfirmationTemplate(order),
    });

    if (error) {
      console.error("Error enviando confirmación:", error);
      return false;
    }

    console.log("Email de confirmación enviado:", data.id);
    return true;
  } catch (error) {
    console.error("Error en email service:", error);
    return false;
  }
};

export const sendStatusUpdate = async (order, newStatus) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "NestyPasto <notificaciones@nestypasto.netlify.app>",
      to: [order.customerEmail],
      subject: `Actualización de Pedido #${order.orderNumber}`,
      html: getStatusUpdateTemplate(order, newStatus),
    });

    if (error) {
      console.error("Error enviando actualización:", error);
      return false;
    }

    console.log("Email de actualización enviado:", data.id);
    return true;
  } catch (error) {
    console.error("Error en email service:", error);
    return false;
  }
};

export const sendAdminNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@nestypasto.com";

  try {
    const { data, error } = await resend.emails.send({
      from: "NestyPasto <notificaciones@nestypasto.netlify.app>",
      to: [adminEmail],
      subject: `Nuevo Pedido #${order.orderNumber} - ${order.customerName}`,
      html: getAdminNotificationTemplate(order),
    });

    if (error) {
      console.error("Error notificando al admin:", error);
      return false;
    }

    console.log("Notificación al admin enviada:", data.id);
    return true;
  } catch (error) {
    console.error("Error en email service:", error);
    return false;
  }
};
