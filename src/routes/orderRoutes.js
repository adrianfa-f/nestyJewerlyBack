// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  trackOrder,
  forceAutoCancel,
  getUserOrders,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/stats", getOrderStats);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);
router.post("/track", trackOrder);
router.post("/force-auto-cancel", forceAutoCancel);
router.get("/user/:email", getUserOrders);
router.post("/:id/cancel", cancelOrder);

export default router;
