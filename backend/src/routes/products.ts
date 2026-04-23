import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ProductService } from '../services/productService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// ── Regras de validação compartilhadas ──
const productValidationRules = (isCreate = false) => [
  // Informações gerais
  isCreate
    ? body('name').trim().notEmpty().withMessage('Nome do produto é obrigatório').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres')
    : body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  // SKU: no create é sempre gerado pelo backend (qualquer valor enviado é ignorado).
  // Em update, permanece opcional/editável para permitir correções pelo usuário.
  ...(isCreate
    ? []
    : [body('code').optional().trim().notEmpty().withMessage('Código não pode ser vazio').isLength({ max: 50 }).withMessage('Código deve ter no máximo 50 caracteres')]),
  body('barcode').optional().isLength({ max: 50 }).withMessage('Código de barras deve ter no máximo 50 caracteres'),
  body('observations').optional().isLength({ max: 2000 }).withMessage('Observações deve ter no máximo 2000 caracteres'),
  body('unitType').optional().isLength({ max: 10 }).withMessage('Tipo de unidade deve ter no máximo 10 caracteres'),

  // Valores
  body('priceCost').optional().isFloat({ min: 0, max: 99999999.99 }).withMessage('Valor de custo deve ser entre 0 e 99.999.999,99'),
  body('priceSale').optional().isFloat({ min: 0, max: 99999999.99 }).withMessage('Valor de venda deve ser entre 0 e 99.999.999,99'),
  body('markup').optional().isFloat({ min: -100, max: 99999.99 }).withMessage('Markup deve ser entre -100 e 99.999,99'),

  // Estoque
  body('quantityStock').optional().isInt({ min: 0, max: 9999999 }).withMessage('Estoque deve ser entre 0 e 9.999.999'),
  body('minStock').optional().isInt({ min: 0, max: 9999999 }).withMessage('Estoque mínimo deve ser entre 0 e 9.999.999'),
  body('maxStock').optional().isInt({ min: 0, max: 9999999 }).withMessage('Estoque máximo deve ser entre 0 e 9.999.999'),

  // Pesos e dimensões
  body('weight').optional().isFloat({ min: 0, max: 9999999.999 }).withMessage('Peso deve ser entre 0 e 9.999.999,999'),
  body('height').optional().isFloat({ min: 0, max: 99999.99 }).withMessage('Altura deve ser entre 0 e 99.999,99'),
  body('width').optional().isFloat({ min: 0, max: 99999.99 }).withMessage('Largura deve ser entre 0 e 99.999,99'),
  body('depth').optional().isFloat({ min: 0, max: 99999.99 }).withMessage('Profundidade deve ser entre 0 e 99.999,99'),

  // Dados fiscais
  body('ncm').optional().isLength({ max: 10 }).withMessage('NCM deve ter no máximo 10 caracteres'),
  body('cest').optional().isLength({ max: 10 }).withMessage('CEST deve ter no máximo 10 caracteres'),
  body('cfop').optional().isLength({ max: 10 }).withMessage('CFOP deve ter no máximo 10 caracteres'),
  body('icmsOrigin').optional().isLength({ max: 10 }).withMessage('Origem ICMS deve ter no máximo 10 caracteres'),
  body('icmsCst').optional().isLength({ max: 10 }).withMessage('CST ICMS deve ter no máximo 10 caracteres'),

  // E-commerce
  body('ecommerceActive').optional().isBoolean().withMessage('Ativo no e-commerce deve ser verdadeiro ou falso'),
  body('ecommerceDescription').optional().isLength({ max: 5000 }).withMessage('Descrição e-commerce deve ter no máximo 5000 caracteres'),
  body('ecommerceSeoTitle').optional().isLength({ max: 200 }).withMessage('Título SEO deve ter no máximo 200 caracteres'),
  body('ecommerceSeoDescription').optional().isLength({ max: 500 }).withMessage('Descrição SEO deve ter no máximo 500 caracteres'),

  // IDs de lookup
  body('categoryId').optional().isInt({ min: 1 }).withMessage('ID de categoria inválido'),
  body('brandId').optional().isInt({ min: 1 }).withMessage('ID de marca inválido'),
  body('collectionId').optional().isInt({ min: 1 }).withMessage('ID de coleção inválido'),
  body('supplierId').optional().isInt({ min: 1 }).withMessage('ID de fornecedor inválido'),
];

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
  productValidationRules(true),
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
  productValidationRules(false),
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
