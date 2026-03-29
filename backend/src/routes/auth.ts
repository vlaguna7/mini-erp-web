import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService, AppError } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const result = await AuthService.registerUser(name, email, password);

      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('Register error:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
);

export default router;
