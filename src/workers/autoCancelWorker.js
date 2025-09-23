// workers/autoCancelWorker.js
import { PrismaClient } from "@prisma/client";
import { sendAutoCancelNotification } from "../services/emailService.js";

const prisma = new PrismaClient();

class AutoCancelWorker {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("AutoCancelWorker started");

    // Ejecutar cada 30 minutos
    this.interval = setInterval(() => {
      this.processPendingCancellations();
    }, 30 * 60 * 1000);

    // Ejecutar inmediatamente al iniciar
    await this.processPendingCancellations();
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isRunning = false;
    console.log("AutoCancelWorker stopped");
  }

  async processPendingCancellations() {
    try {
      console.log("Processing pending auto-cancellations...");

      // Paso 1: Cancelar órdenes pendientes con más de 24 horas
      const cancelledOrders = await prisma.$executeRaw`
        UPDATE "Order" 
        SET status = 'cancelled',
            "updatedAt" = NOW()
        WHERE status = 'pending' 
        AND "createdAt" < NOW() - INTERVAL '24 hours'
        RETURNING *
      `;

      if (cancelledOrders > 0) {
        console.log(`Cancelled ${cancelledOrders} old orders`);
      }

      // Paso 2: Obtener órdenes canceladas recientemente para notificar
      const recentCancelledOrders = await prisma.order.findMany({
        where: {
          status: "cancelled",
          updatedAt: {
            gte: new Date(Date.now() - 35 * 60 * 1000), // Últimos 35 minutos
          },
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Más de 24 horas
          },
        },
      });

      // Paso 3: Enviar notificaciones por email
      for (const order of recentCancelledOrders) {
        try {
          await sendAutoCancelNotification(order);
          console.log(`Notification sent for order #${order.orderNumber}`);
        } catch (error) {
          console.error(
            `Error sending notification for order #${order.orderNumber}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error in auto-cancel worker:", error);
    }
  }
}

export default AutoCancelWorker;
