import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ReturnService } from '../services/returnService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post(
  '/',
  [
    body('saleId').isInt({ min: 1 }).withMessage('saleId é obrigatório'),
    body('resolutionMethod').isIn(['TROCA', 'DEVOLVER_PAGAMENTO', 'GERAR_CREDITO']).withMessage('Método de devolução inválido'),
    body('items').isArray({ min: 1 }).withMessage('Selecione ao menos um produto'),
    body('items.*.saleItemId').isInt({ min: 1 }),
    body('items.*.quantity').isInt({ min: 1, max: 9999999 }),
    body('clientId').optional({ nullable: true }).isInt({ min: 1 }),
    body('observation').optional({ nullable: true }).isString().isLength({ max: 255 }),
    body('returnDate').optional({ nullable: true }).isISO8601(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const result = await ReturnService.createReturn(req.user!.id, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      if (error?.status) return res.status(error.status).json({ error: error.message });
      console.error('Erro ao criar devolução:', error);
      return res.status(500).json({ error: 'Erro interno ao criar devolução' });
    }
  }
);

router.get('/by-sale/:saleId', async (req: AuthRequest, res: Response) => {
  try {
    const saleId = parseInt(req.params.saleId);
    if (!Number.isFinite(saleId) || saleId <= 0) return res.status(400).json({ error: 'saleId inválido' });

    const returns = await ReturnService.getReturnsBySale(req.user!.id, saleId);
    return res.json({ returns });
  } catch (error: any) {
    if (error?.status) return res.status(error.status).json({ error: error.message });
    console.error('Erro ao listar devoluções da venda:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
