// routes/wishlist.js
import express from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist,
  checkWishlist
} from '../controllers/wishlistController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/', removeFromWishlist);
router.get('/check', checkWishlist);

export default router;