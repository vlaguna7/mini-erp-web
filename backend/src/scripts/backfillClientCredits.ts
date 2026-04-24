/**
 * Backfill de saldo de crédito dos clientes.
 *
 * Popula, para registros anteriores à migração add_client_credit_tracking:
 *   - Return.resolutionMethod   (parseando o prefixo `[METHOD]` que foi gravado em `reason`)
 *   - Return.refundValue        (calculado a partir do saleItem.unitPrice histórico)
 *   - Return.clientId           (igual ao sale.clientId, que era o comportamento implícito)
 *   - FinancialTransaction.clientId (por venda referenciada na description)
 *   - Client.creditBalance      (recomputado como SUM(refundValue) de returns GERAR_CREDITO)
 *
 * Roda em modo DRY-RUN por padrão. Para aplicar:
 *   npx ts-node src/scripts/backfillClientCredits.ts --apply
 *
 * Seguro para rodar múltiplas vezes (idempotente): só toca registros onde os campos
 * ainda estão NULL, e recalcula o creditBalance por tenant de forma determinística.
 */

import prisma from '../db/prismaClient';

type Method = 'TROCA' | 'DEVOLVER_PAGAMENTO' | 'GERAR_CREDITO';

function parseMethodFromReason(reason: string | null | undefined): Method | null {
  if (!reason) return null;
  const m = reason.match(/^\[(TROCA|DEVOLVER_PAGAMENTO|GERAR_CREDITO)\]/);
  return m ? (m[1] as Method) : null;
}

function parseSaleIdFromDescription(desc: string | null | undefined): number | null {
  if (!desc) return null;
  const m = desc.match(/venda\s+#(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

async function run(apply: boolean) {
  console.log(apply ? '🟢 Modo APPLY — mudanças serão persistidas.' : '🔵 Modo DRY-RUN — nada será gravado.');

  // ─── 1. Backfill dos Returns ───
  const pendingReturns = await prisma.return.findMany({
    where: {
      OR: [{ resolutionMethod: null }, { refundValue: null }, { clientId: null }],
    },
    select: {
      id: true,
      userId: true,
      saleId: true,
      productId: true,
      quantity: true,
      reason: true,
      resolutionMethod: true,
      refundValue: true,
      clientId: true,
    },
  });

  console.log(`Returns a processar: ${pendingReturns.length}`);

  // Pré-carrega saleItems e sale.clientId dos sales envolvidos
  const saleIds = Array.from(new Set(pendingReturns.map((r) => r.saleId).filter((v): v is number => !!v)));
  const sales = await prisma.sale.findMany({
    where: { id: { in: saleIds } },
    select: {
      id: true,
      userId: true,
      clientId: true,
      items: { select: { productId: true, quantity: true, unitPrice: true } },
    },
  });
  const saleMap = new Map(sales.map((s) => [s.id, s]));

  let returnsUpdated = 0;
  let returnsSkipped = 0;

  for (const r of pendingReturns) {
    const patch: {
      resolutionMethod?: Method;
      refundValue?: number;
      clientId?: number;
    } = {};

    if (!r.resolutionMethod) {
      const method = parseMethodFromReason(r.reason);
      if (method) patch.resolutionMethod = method;
    }

    if (r.refundValue == null && r.saleId) {
      const sale = saleMap.get(r.saleId);
      if (sale && sale.userId === r.userId) {
        // Segurança: confere que a sale pertence ao mesmo tenant do return.
        const matches = sale.items.filter((it) => it.productId === r.productId);
        if (matches.length > 0) {
          const totalQty = matches.reduce((s, it) => s + it.quantity, 0);
          const weighted = matches.reduce((s, it) => s + Number(it.unitPrice) * it.quantity, 0);
          const avg = totalQty > 0 ? weighted / totalQty : 0;
          patch.refundValue = Number((avg * r.quantity).toFixed(2));
        }
      }
    }

    if (r.clientId == null && r.saleId) {
      const sale = saleMap.get(r.saleId);
      if (sale && sale.userId === r.userId && sale.clientId) {
        patch.clientId = sale.clientId;
      }
    }

    if (Object.keys(patch).length === 0) {
      returnsSkipped++;
      continue;
    }

    if (apply) {
      // updateMany com where por userId previne qualquer cruzamento entre tenants.
      await prisma.return.updateMany({
        where: { id: r.id, userId: r.userId },
        data: patch,
      });
    }
    returnsUpdated++;
  }

  console.log(`  ✓ Returns atualizados: ${returnsUpdated}   sem dados suficientes: ${returnsSkipped}`);

  // ─── 2. Backfill dos FinancialTransactions originados de devolução ───
  const pendingFTs = await prisma.financialTransaction.findMany({
    where: {
      clientId: null,
      category: { in: ['Devolução de venda', 'Crédito de devolução'] },
    },
    select: { id: true, userId: true, description: true },
  });

  console.log(`FinancialTransactions a processar: ${pendingFTs.length}`);

  let ftsUpdated = 0;
  let ftsSkipped = 0;

  for (const ft of pendingFTs) {
    const saleId = parseSaleIdFromDescription(ft.description);
    if (!saleId) {
      ftsSkipped++;
      continue;
    }
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, userId: ft.userId },
      select: { clientId: true },
    });
    if (!sale || !sale.clientId) {
      ftsSkipped++;
      continue;
    }
    if (apply) {
      await prisma.financialTransaction.updateMany({
        where: { id: ft.id, userId: ft.userId },
        data: { clientId: sale.clientId },
      });
    }
    ftsUpdated++;
  }

  console.log(`  ✓ FinancialTransactions atualizados: ${ftsUpdated}   sem dados suficientes: ${ftsSkipped}`);

  // ─── 3. Recomputa Client.creditBalance ───
  // Soma SOMENTE returns com resolutionMethod='GERAR_CREDITO' (após o passo 1, isso já está normalizado).
  // Por tenant, para não cruzar dados entre usuários.
  const users = await prisma.user.findMany({ select: { id: true } });
  let balancesAdjusted = 0;

  for (const u of users) {
    const clients = await prisma.client.findMany({
      where: { userId: u.id },
      select: { id: true, creditBalance: true },
    });

    for (const c of clients) {
      const agg = await prisma.return.aggregate({
        where: {
          userId: u.id,
          clientId: c.id,
          resolutionMethod: 'GERAR_CREDITO',
        },
        _sum: { refundValue: true },
      });
      const expected = Number(agg._sum.refundValue ?? 0);
      const current = Number(c.creditBalance);
      if (Math.abs(expected - current) > 0.005) {
        console.log(`  ajuste: client=${c.id} (user=${u.id}) ${current.toFixed(2)} -> ${expected.toFixed(2)}`);
        if (apply) {
          await prisma.client.updateMany({
            where: { id: c.id, userId: u.id },
            data: { creditBalance: expected },
          });
        }
        balancesAdjusted++;
      }
    }
  }

  console.log(`  ✓ Saldos ajustados: ${balancesAdjusted}`);

  console.log(apply ? '✅ Backfill concluído.' : '✅ Dry-run concluído. Rode com --apply para persistir.');
}

const apply = process.argv.includes('--apply');
run(apply)
  .catch((e) => {
    console.error('❌ Erro no backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
