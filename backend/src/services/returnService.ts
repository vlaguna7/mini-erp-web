import prisma from '../db/prismaClient';

export type ResolutionMethod = 'TROCA' | 'DEVOLVER_PAGAMENTO' | 'GERAR_CREDITO';

interface CreateReturnItem {
  saleItemId: number;
  quantity: number;
}

interface CreateReturnData {
  saleId: number;
  items: CreateReturnItem[];
  resolutionMethod: ResolutionMethod;
  clientId?: number | null;
  observation?: string | null;
  returnDate?: string;
}

const METHOD_LABEL: Record<ResolutionMethod, string> = {
  TROCA: 'Trocar Produtos',
  DEVOLVER_PAGAMENTO: 'Devolver Pagamentos',
  GERAR_CREDITO: 'Gerar Crédito',
};

// Armazena método + observação do usuário dentro do campo `reason` (VarChar 255).
// Prefixo [METHOD] permite parse futuro se virar coluna própria no schema.
function buildReason(method: ResolutionMethod, obs?: string | null): string {
  const note = (obs || '').trim();
  const base = `[${method}]`;
  if (!note) return base.slice(0, 255);
  return `${base} ${note}`.slice(0, 255);
}

export class ReturnService {
  static async createReturn(userId: number, data: CreateReturnData) {
    if (!['TROCA', 'DEVOLVER_PAGAMENTO', 'GERAR_CREDITO'].includes(data.resolutionMethod)) {
      throw { status: 400, message: 'Método de devolução inválido' };
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw { status: 400, message: 'Selecione ao menos um produto para devolver' };
    }

    // 1. Validar venda pertence ao usuário, com itens originais
    const sale = await prisma.sale.findFirst({
      where: { id: data.saleId, userId },
      include: {
        items: true,
        client: { select: { id: true, name: true } },
      },
    });
    if (!sale) throw { status: 404, message: 'Venda não encontrada' };

    // 2. Validar clientId (se fornecido) pertence ao usuário
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, userId },
        select: { id: true },
      });
      if (!client) throw { status: 400, message: 'Cliente inválido' };
    }

    // 3. Mapear saleItems originais por id
    const saleItemsById = new Map(sale.items.map((si) => [si.id, si]));

    // 4. Validar itens de devolução contra os itens originais
    for (const ret of data.items) {
      const si = saleItemsById.get(ret.saleItemId);
      if (!si) throw { status: 400, message: 'Item de venda não encontrado para devolução' };
      if (!Number.isInteger(ret.quantity) || ret.quantity <= 0) {
        throw { status: 400, message: 'Quantidade de devolução inválida' };
      }
      if (ret.quantity > si.quantity) {
        throw { status: 400, message: `Quantidade de devolução (${ret.quantity}) maior que vendida (${si.quantity})` };
      }
    }

    // 5. Subtrair o que já foi devolvido antes desta venda
    const priorReturns = await prisma.return.findMany({
      where: { userId, saleId: sale.id },
      select: { productId: true, quantity: true },
    });
    const alreadyReturnedByProduct = new Map<number, number>();
    for (const r of priorReturns) {
      alreadyReturnedByProduct.set(r.productId, (alreadyReturnedByProduct.get(r.productId) || 0) + r.quantity);
    }

    // 6. Totais a devolver por produto (considerando itens com mesmo productId)
    const requestedByProduct = new Map<number, number>();
    for (const ret of data.items) {
      const si = saleItemsById.get(ret.saleItemId)!;
      requestedByProduct.set(si.productId, (requestedByProduct.get(si.productId) || 0) + ret.quantity);
    }

    // 7. Total de cada produto vendido originalmente
    const soldByProduct = new Map<number, number>();
    for (const si of sale.items) {
      soldByProduct.set(si.productId, (soldByProduct.get(si.productId) || 0) + si.quantity);
    }

    for (const [productId, req] of requestedByProduct.entries()) {
      const sold = soldByProduct.get(productId) || 0;
      const alreadyRet = alreadyReturnedByProduct.get(productId) || 0;
      if (req + alreadyRet > sold) {
        throw {
          status: 400,
          message: `Quantidade excede o saldo devolvível do produto (vendido ${sold}, já devolvido ${alreadyRet}, solicitado ${req})`,
        };
      }
    }

    // 8. Valor total a reembolsar (unitPrice x quantidade)
    const totalRefund = data.items.reduce((sum, ret) => {
      const si = saleItemsById.get(ret.saleItemId)!;
      return sum + Number(si.unitPrice) * ret.quantity;
    }, 0);

    const targetClientId = data.clientId ?? sale.clientId ?? null;
    const returnDate = data.returnDate ? new Date(data.returnDate) : new Date();
    const reason = buildReason(data.resolutionMethod, data.observation);

    // 9. Transação: cria Returns + devolve estoque + cria FinancialTransaction se aplicável
    const result = await prisma.$transaction(async (tx) => {
      const createdReturns: { id: number }[] = [];
      for (const ret of data.items) {
        const si = saleItemsById.get(ret.saleItemId)!;
        const r = await tx.return.create({
          data: {
            userId,
            saleId: sale.id,
            productId: si.productId,
            quantity: ret.quantity,
            reason,
            returnDate,
          },
        });
        createdReturns.push({ id: r.id });

        await tx.product.update({
          where: { id: si.productId },
          data: { quantityStock: { increment: ret.quantity } },
        });
      }

      let financialTransactionId: number | null = null;
      if (data.resolutionMethod === 'DEVOLVER_PAGAMENTO' || data.resolutionMethod === 'GERAR_CREDITO') {
        const category =
          data.resolutionMethod === 'DEVOLVER_PAGAMENTO'
            ? 'Devolução de venda'
            : 'Crédito de devolução';
        const descPrefix = data.resolutionMethod === 'DEVOLVER_PAGAMENTO' ? 'Devolução' : 'Crédito';
        const clientPart = sale.client ? ` — ${sale.client.name}` : '';
        const tx1 = await tx.financialTransaction.create({
          data: {
            userId,
            type: 'DESPESA',
            category,
            description: `${descPrefix} referente à venda #${sale.id}${clientPart}`.slice(0, 255),
            value: totalRefund,
            date: returnDate,
            paymentMethod: null,
            status: 'PAGO',
            notes: data.observation?.trim() || null,
          },
        });
        financialTransactionId = tx1.id;
      }

      return { returnIds: createdReturns.map((r) => r.id), financialTransactionId };
    });

    return {
      saleId: sale.id,
      resolutionMethod: data.resolutionMethod,
      resolutionLabel: METHOD_LABEL[data.resolutionMethod],
      totalRefund,
      returnIds: result.returnIds,
      financialTransactionId: result.financialTransactionId,
      clientId: targetClientId,
    };
  }

  static async getReturnsBySale(userId: number, saleId: number) {
    const sale = await prisma.sale.findFirst({ where: { id: saleId, userId }, select: { id: true } });
    if (!sale) throw { status: 404, message: 'Venda não encontrada' };

    const returns = await prisma.return.findMany({
      where: { userId, saleId },
      include: {
        product: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return returns;
  }
}
