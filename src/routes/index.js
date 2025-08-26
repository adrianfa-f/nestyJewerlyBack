import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import paymentRoutes from './paymentRoutes.js'
import wishlistRoutes from './wishlistRoutes.js'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/payments', paymentRoutes)
router.use('/wishlist', wishlistRoutes)


export default router;