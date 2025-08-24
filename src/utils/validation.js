import { body, validationResult } from 'express-validator';

// Validación para creación/actualización de productos
export const validateProduct = [
  // Validar nombre
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del producto es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  // Validar descripción
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  
  // Validar precio
  body('price')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor que 0'),
  
  // Validar SKU
  body('sku')
    .trim()
    .notEmpty().withMessage('El SKU es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El SKU debe tener entre 3 y 50 caracteres'),
  
  // Validar stock
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo'),
  
  // Validar categoría
  body('category')
    .trim()
    .notEmpty().withMessage('La categoría es requerida')
    .isIn([
    'Anillos compromiso',
    'Anillos matrimonio',
    'Collares y cadenas',
    'Pulseras y brazaletes',
    'Aretes y pendientes',
    'Dijes y charms',
    'Broches y alfileres'
  ]).withMessage('Categoría inválida'),
  
  // Validar estado
  body('status')
    .optional()
    .isIn(['active', 'featured']).withMessage('Estado inválido'),
  
  // Validar imágenes (solo en creación)
  body('mainImageFile')
    .if(({ req }) => req.method === 'POST')
    .notEmpty().withMessage('La imagen principal es requerida'),
  
  // Middleware para manejar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validación para registro de usuarios
export const validateUser = [
  // Validar email
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido'),
  
  // Validar contraseña
  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  // Middleware para manejar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validación para login
export const validateLogin = [
  // Validar email
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido'),
  
  // Validar contraseña
  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida'),
  
  // Middleware para manejar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validación para carrito
export const validateCart = [
  // Validar ID de producto
  body('productId')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),
  
  // Validar cantidad
  body('quantity')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  
  // Middleware para manejar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validación para IDs numéricos en parámetros
export const validateIdParam = (paramName) => {
  return [
    // Validar que sea un número entero
    param(paramName)
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    // Middleware para manejar errores
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
};