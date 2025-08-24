// Validación para pagos
import { body, validationResult } from 'express-validator'

export const validatePayment = [
  body('amount')
    .isInt({ min: 100 })
    .withMessage('El monto debe ser de al menos 1€ (100 céntimos)'),
  body('currency')
    .optional()
    .isIn(['eur'])
    .withMessage('Solo se acepta EUR como moneda'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];