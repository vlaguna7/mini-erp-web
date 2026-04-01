import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ProductBrandService } from '../services/productBrandService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = await ProductBrandService.getByUser(req.user!.id);
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
      const item = await ProductBrandService.create(req.user!.id, req.body.name);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await ProductBrandService.delete(req.user!.id, parseInt(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
