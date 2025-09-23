import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);

export default router;
