import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateCampaignInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom de la campagne est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le nom doit faire entre 3 et 100 caractères'),
  
  body('targetType')
    .isIn(['department', 'specific_users', 'all'])
    .withMessage('Type de ciblage invalide'),
  
  body('targetIds')
    .optional()
    .isArray().withMessage('Les IDs de cibles doivent être un tableau'),
  
  body('templateType')
    .isIn(['predefined', 'custom', 'ai_generated'])
    .withMessage('Type de template invalide'),
  
  body('templateId')
    .optional()
    .isUUID().withMessage('ID de template invalide'),
  
  body('customTemplate')
    .optional()
    .isObject().withMessage('Le template personnalisé doit être un objet'),
  
  body('customTemplate.subject')
    .optional()
    .trim()
    .notEmpty().withMessage('Le sujet est requis'),
  
  body('customTemplate.body')
    .optional()
    .trim()
    .notEmpty().withMessage('Le corps de l\'email est requis'),
  
  body('aiPrompt')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Le prompt IA doit faire entre 10 et 1000 caractères'),
  
  body('scheduledAt')
    .optional()
    .isISO8601().withMessage('Date invalide'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }
    next();
  }
];