// services/orderService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrder = async (orderData) => {
  return prisma.order.create({
    data: {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerCity: orderData.customerCity,
      customerPostalCode: orderData.customerPostalCode,
      items: orderData.items,
      total: orderData.total,
      notes: orderData.notes,
    },
  });
};

export const getOrders = async () => {
  return prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id: parseInt(id) },
  });
};

export const updateOrderStatus = async (id, status) => {
  return prisma.order.update({
    where: { id: parseInt(id) },
    data: { status },
  });
};

export const deleteOrder = async (id) => {
  return prisma.order.delete({
    where: { id: parseInt(id) },
  });
};

export const getOrderStats = async () => {
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: { status: "pending" },
  });
  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { in: ["paid", "completed", "shipped"] } },
  });

  return {
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.total || 0,
  };
};
