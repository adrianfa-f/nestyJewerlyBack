// routes/cart.js
import express from 'express';
import { 
  getCart, 
  addToCart, 
  removeFromCart,
  updateCartItem,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCartItem);
router.delete('/item', removeFromCart);
router.delete('/clear', clearCart);

export default router;