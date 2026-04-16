import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ClientService } from '../services/clientService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// ── Regras de validação compartilhadas ──
const clientValidationRules = (isCreate = false) => [
  // Dados gerais
  isCreate
    ? body('name').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres')
    : body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('personType').optional().isIn(['fisica', 'juridica']).withMessage('Tipo de pessoa inválido'),
  body('cpfCnpj').optional().isLength({ max: 18 }).withMessage('CPF/CNPJ deve ter no máximo 18 caracteres'),
  body('gender').optional().isLength({ max: 20 }).withMessage('Gênero deve ter no máximo 20 caracteres'),
  body('birthDate').optional().isLength({ max: 10 }).withMessage('Data de nascimento inválida'),
  body('phone').optional().isLength({ max: 100 }).withMessage('Telefone deve ter no máximo 100 caracteres'),
  body('whatsapp').optional().isLength({ max: 20 }).withMessage('WhatsApp deve ter no máximo 20 caracteres'),
  body('instagram').optional().isLength({ max: 100 }).withMessage('Instagram deve ter no máximo 100 caracteres'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('E-mail inválido').isLength({ max: 100 }).withMessage('E-mail deve ter no máximo 100 caracteres'),
  body('category').optional().isLength({ max: 50 }).withMessage('Categoria deve ter no máximo 50 caracteres'),
  body('photo').optional().isLength({ max: 7340032 }).withMessage('Foto muito grande (máximo ~5MB)'),

  // Endereço
  body('zipCode').optional().isLength({ max: 10 }).withMessage('CEP deve ter no máximo 10 caracteres'),
  body('street').optional().isLength({ max: 200 }).withMessage('Rua deve ter no máximo 200 caracteres'),
  body('number').optional().isLength({ max: 20 }).withMessage('Número deve ter no máximo 20 caracteres'),
  body('complement').optional().isLength({ max: 100 }).withMessage('Complemento deve ter no máximo 100 caracteres'),
  body('neighborhood').optional().isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
  body('city').optional().isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres'),
  body('state').optional().isLength({ max: 2 }).withMessage('Estado deve ter no máximo 2 caracteres'),

  // Observações
  body('observations').optional().isLength({ max: 2000 }).withMessage('Observações deve ter no máximo 2000 caracteres'),
];

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(0, (parseInt(req.query.page as string) || 1) - 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = page * limit;

    const result = await ClientService.getClientsByUser(req.user!.id, limit, offset);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const client = await ClientService.getClientById(
      req.user!.id,
      parseInt(req.params.id)
    );
    res.status(200).json(client);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post(
  '/',
  clientValidationRules(true),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const client = await ClientService.createClient(req.user!.id, req.body);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.put(
  '/:id',
  clientValidationRules(false),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const clientId = parseInt(req.params.id);
      const client = await ClientService.updateClient(req.user!.id, clientId, req.body);
      res.status(200).json(client);
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
    const clientId = parseInt(req.params.id);
    const result = await ClientService.deleteClient(req.user!.id, clientId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
