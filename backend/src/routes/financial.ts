import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { FinancialService } from '../services/financialService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

/* ─── Transações Financeiras ─────────────────────── */

router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { type, date_from, date_to } = req.query as any;
    const items = await FinancialService.getTransactions(req.user!.id, { type, date_from, date_to });
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/transactions',
  [
    body('type').trim().notEmpty().withMessage('Tipo é obrigatório'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
    body('value').isNumeric().withMessage('Valor é obrigatório'),
    body('date').trim().notEmpty().withMessage('Data é obrigatória'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const item = await FinancialService.createTransaction(req.user!.id, req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.put('/transactions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await FinancialService.updateTransaction(req.user!.id, parseInt(req.params.id), req.body);
    res.status(200).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/transactions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await FinancialService.deleteTransaction(req.user!.id, parseInt(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/* ─── Despesas Recorrentes ───────────────────────── */

router.get('/recurring', async (req: AuthRequest, res: Response) => {
  try {
    const items = await FinancialService.getRecurringExpenses(req.user!.id);
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/recurring',
  [
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
    body('value').isNumeric().withMessage('Valor é obrigatório'),
    body('frequency').trim().notEmpty().withMessage('Frequência é obrigatória'),
    body('startDate').trim().notEmpty().withMessage('Data de início é obrigatória'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const item = await FinancialService.createRecurringExpense(req.user!.id, req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.put('/recurring/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await FinancialService.updateRecurringExpense(req.user!.id, parseInt(req.params.id), req.body);
    res.status(200).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/recurring/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await FinancialService.deleteRecurringExpense(req.user!.id, parseInt(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
