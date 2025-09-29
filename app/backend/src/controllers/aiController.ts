import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.js';
import { AIProviderFactory } from '../services/aiProvider.js';

export const generateContent = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateType, context } = req.body;

    const aiProvider = AIProviderFactory.create();
    const content = await aiProvider.generate(templateType, context);

    res.json(content);
  } catch (error) {
    console.error('GenerateContent error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de contenu' });
  }
};