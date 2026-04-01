import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ProductService } from '../services/productService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(0, (parseInt(req.query.page as string) || 1) - 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = page * limit;

    const result = await ProductService.getProductsByUser(req.user!.id, limit, offset);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/low-stock', async (req: AuthRequest, res: Response) => {
  try {
    const products = await ProductService.getLowStockProducts(req.user!.id);
    res.status(200).json({ products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await ProductService.getProductById(
      req.user!.id,
      parseInt(req.params.id)
    );
    res.status(200).json(product);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome do produto é obrigatório'),
    body('code').trim().notEmpty().withMessage('Código do produto é obrigatório'),
    body('priceSale')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    body('priceCost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    body('quantityStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantidade deve ser um inteiro positivo'),
    body('minStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um inteiro positivo'),
    body('maxStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque máximo deve ser um inteiro positivo'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await ProductService.createProduct(req.user!.id, req.body);

      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('code').optional().trim().notEmpty(),
    body('priceSale').optional().isFloat({ min: 0 }),
    body('priceCost').optional().isFloat({ min: 0 }),
    body('quantityStock').optional().isInt({ min: 0 }),
    body('minStock').optional().isInt({ min: 0 }),
    body('maxStock').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const productId = parseInt(req.params.id);
      const product = await ProductService.updateProduct(
        req.user!.id,
        productId,
        req.body
      );

      res.status(200).json(product);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await ProductService.deleteProduct(req.user!.id, productId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
