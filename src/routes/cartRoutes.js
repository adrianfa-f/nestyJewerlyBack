import express from 'express';
import { 
  getCart, 
  addToCart, 
  removeFromCart 
} from '../controllers/cartController.js';

const router = express.Router();

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', removeFromCart);

export default router;