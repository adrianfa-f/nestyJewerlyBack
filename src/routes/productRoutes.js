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

// Actualizar rutas POST y PUT para manejar uploads
router.post(
  '/', 
  authenticate, 
  authorize(['admin']), 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'hoverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
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
    { name: 'images', maxCount: 10 }
  ]),
  validateProduct,
  updateProduct
);

router.delete('/:id', authenticate, authorize(['admin']), deleteProduct);

export default router;