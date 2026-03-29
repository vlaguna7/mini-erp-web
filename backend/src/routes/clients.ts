import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ClientService } from '../services/clientService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

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
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('E-mail inválido'),
    body('personType').optional().isIn(['fisica', 'juridica']).withMessage('Tipo de pessoa inválido'),
  ],
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
  [
    body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('E-mail inválido'),
    body('personType').optional().isIn(['fisica', 'juridica']).withMessage('Tipo de pessoa inválido'),
  ],
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
