import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { EmployeeService } from '../services/employeeService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = await EmployeeService.getByUser(req.user!.id);
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Nome é obrigatório')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const item = await EmployeeService.create(req.user!.id, req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.put(
  '/:id',
  [body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const item = await EmployeeService.update(req.user!.id, parseInt(req.params.id), req.body);
      res.status(200).json(item);
    } catch (error: any) {
      res.status(error.message === 'Vendedor não encontrado' ? 404 : 400).json({ error: error.message });
    }
  }
);

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await EmployeeService.delete(req.user!.id, parseInt(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
