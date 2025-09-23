// controllers/orderController.js
import * as orderService from "../services/orderService.js";
import { PrismaClient } from "@prisma/client";
import {
  sendOrderConfirmation,
  sendAdminNotification,
  sendStatusUpdate,
  sendAutoCancelNotification,
} from "../services/emailService.js";

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);

    // Guardar en localStorage simulation (para el frontend)
    const orderInfo = {
      orderNumber: order.orderNumber,
      email: order.customerEmail,
      createdAt: order.createdAt,
    };

    // Enviar emails de forma asíncrona
    Promise.all([
      sendOrderConfirmation(order),
      sendAdminNotification(order),
    ]).catch(console.error);

    res.status(201).json({
      ...order,
      localStorageInfo: orderInfo, // Información para guardar en localStorage
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Nueva función para obtener órdenes de un usuario
export const getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        customerEmail: email,
        status: {
          in: ["pending", "paid", "shipped"], // Solo órdenes activas
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nueva función para cancelar orden desde el frontend
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Solo permitir cancelar órdenes pendientes
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Solo se pueden cancelar órdenes pendientes",
      });
    }

    // Verificar que no tenga más de 24 horas
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (orderAge > twentyFourHours) {
      return res.status(400).json({
        message: "Esta orden ya ha expirado y será cancelada automáticamente",
      });
    }

    // Actualizar estado a cancelled
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    // Enviar notificación de cancelación
    sendAutoCancelNotification(updatedOrder).catch(console.error);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    // Enviar email de actualización de estado si corresponde
    if (
      ["paid", "shipped", "completed", "cancelled"].includes(req.body.status)
    ) {
      sendStatusUpdate(order, req.body.status).catch(console.error);
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const forceAutoCancel = async (req, res) => {
  try {
    const result = await prisma.$executeRaw`
      UPDATE "Order" 
      SET status = 'cancelled',
          "updatedAt" = NOW()
      WHERE status = 'pending' 
      AND "createdAt" < NOW() - INTERVAL '1 minute'
      RETURNING *
    `;

    res.json({ cancelled: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mantener las funciones existentes sin cambios
export const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        customerEmail: email,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
