import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { SaleService } from '../services/saleService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// POST / — criar venda
router.post(
  '/',
  [
    body('client_id').isInt({ min: 1 }).withMessage('client_id é obrigatório'),
    body('items').isArray({ min: 1 }).withMessage('items deve conter ao menos 1 produto'),
    body('items.*.product_id').isInt({ min: 1 }),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.unit_price').isFloat({ min: 0 }),
    body('payments').isArray({ min: 1 }).withMessage('payments deve conter ao menos 1 pagamento'),
    body('payments.*.method').isString().notEmpty(),
    body('payments.*.label').isString().notEmpty(),
    body('payments.*.amount').isFloat({ min: 0.01 }),
    body('total').isFloat({ min: 0 }).withMessage('total é obrigatório'),
    body('subtotal').isFloat({ min: 0 }).withMessage('subtotal é obrigatório'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.id;
      const sale = await SaleService.createSale(userId, req.body);

      return res.status(201).json(sale);
    } catch (error: any) {
      console.error('Erro ao criar venda:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao criar venda' });
    }
  }
);

// GET / — listar vendas do usuário
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const result = await SaleService.getSalesByUser(userId, limit, offset);

    return res.json({
      sales: result.sales,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error: any) {
    console.error('Erro ao listar vendas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar vendas' });
  }
});

// GET /:id — detalhe de uma venda
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const saleId = parseInt(req.params.id);

    if (isNaN(saleId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const sale = await SaleService.getSaleById(userId, saleId);
    return res.json(sale);
  } catch (error: any) {
    console.error('Erro ao buscar venda:', error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro interno ao buscar venda' });
  }
});

export default router;
