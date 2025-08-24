import express from 'express';
import { changePassword, getProfile, login, register, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { verifyToken } from '../config/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;