import { Router, Response } from 'express';
import { ReportService } from '../services/reportService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

/* helper */
const intOrUndef = (v: any) => { const n = parseInt(v); return isNaN(n) ? undefined : n; };
const floatOrZero = (v: any) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

router.get('/sales', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.salesReport(req.user!.id, req.query.date_from as string, req.query.date_to as string, (req.query.group_by as string) || 'sale');
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/commissions', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.commissionsReport(req.user!.id, req.query.date_from as string, req.query.date_to as string, floatOrZero(req.query.commission_rate));
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/sales-channels', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.salesChannelsReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/daily-cash', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.dailyCashReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/payment-methods', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.paymentMethodsReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/cash-flow', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.cashFlowReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/product-performance', async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query;
    const data = await ReportService.productPerformanceReport(
      req.user!.id, q.date_from as string, q.date_to as string,
      intOrUndef(q.category_id), intOrUndef(q.brand_id), intOrUndef(q.collection_id), intOrUndef(q.supplier_id), intOrUndef(q.seller_id)
    );
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/sales-by-category', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.salesByCategoryReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/stock-inventory', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.stockInventoryReport(req.user!.id);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/clients', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.clientReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/client-lifecycle', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.clientLifecycleReport(req.user!.id);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

router.get('/client-credits', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ReportService.clientCreditsReport(req.user!.id, req.query.date_from as string, req.query.date_to as string);
    res.json(data);
  } catch (e: any) { console.error('Report error:', e); res.status(500).json({ error: 'Erro ao gerar relatório' }); }
});

export default router;
