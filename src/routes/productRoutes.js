import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validateProduct } from '../utils/validation.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

router.post(
  '/', 
  authenticate, 
  authorize(['admin']), 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'hoverImage', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]),
  validateProduct,
  createProduct
);

router.put(
  '/:id', 
  authenticate, 
  authorize(['admin']), 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'hoverImage', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]),
  validateProduct,
  updateProduct
);

router.delete('/:id', authenticate, authorize(['admin']), deleteProduct);

export default router;