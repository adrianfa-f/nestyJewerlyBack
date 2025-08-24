import multer from 'multer';
import { storage } from '../config/cloudinary.js';

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
  }
});