import prisma from '../db/prismaClient';

interface CreateSaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

interface CreateSalePayment {
  method: string;
  label: string;
  amount: number;
  installments?: number;
  cardBrand?: string;
}

interface CreateSaleData {
  client_id: number;
  seller_id?: number | null;
  items: CreateSaleItem[];
  payments: CreateSalePayment[];
  subtotal: number;
  discount: number;
  surcharge: number;
  total: number;
  presence_indicator?: string;
  sale_category?: string;
  observation?: string;
}

export class SaleService {
  static async createSale(userId: number, data: CreateSaleData) {
    // Validate that all products belong to this user
    const productIds = data.items.map((i) => i.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, userId },
      select: { id: true, quantityStock: true },
    });

    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      throw { status: 400, message: `Produtos não encontrados: ${missing.join(', ')}` };
    }

    // Check stock availability
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.product_id)!;
      if (product.quantityStock < item.quantity) {
        throw {
          status: 400,
          message: `Estoque insuficiente para produto ID ${item.product_id}. Disponível: ${product.quantityStock}, Solicitado: ${item.quantity}`,
        };
      }
    }

    // Transaction: create sale + items + payments + decrement stock
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          userId,
          clientId: data.client_id,
          sellerId: data.seller_id || null,
          totalValue: data.total,
          subtotal: data.subtotal,
          discount: data.discount,
          surcharge: data.surcharge,
          presenceIndicator: data.presence_indicator || null,
          saleCategory: data.sale_category || null,
          observation: data.observation || null,
          saleDate: new Date(),
        },
      });

      // Create sale items
      await tx.saleItem.createMany({
        data: data.items.map((item) => ({
          saleId: newSale.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.unit_price * item.quantity,
        })),
      });

      // Create sale payments
      await tx.salePayment.createMany({
        data: data.payments.map((p) => ({
          saleId: newSale.id,
          method: p.method,
          label: p.label,
          amount: p.amount,
          installments: p.installments || null,
          cardBrand: p.cardBrand || null,
        })),
      });

      // Decrement stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { quantityStock: { decrement: item.quantity } },
        });
      }

      return newSale;
    });

    // Return full sale with relations
    return prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        client: { select: { id: true, name: true, cpfCnpj: true, phone: true, email: true } },
        seller: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, code: true } },
          },
        },
        payments: true,
      },
    });
  }

  static async getSalesByUser(userId: number, limit: number = 20, offset: number = 0) {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: { userId },
        include: {
          client: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        skip: offset,
      }),
      prisma.sale.count({ where: { userId } }),
    ]);

    return { sales, total };
  }

  static async getSaleById(userId: number, saleId: number) {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        client: { select: { id: true, name: true, cpfCnpj: true, phone: true, email: true } },
        seller: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, code: true } },
          },
        },
        payments: true,
      },
    });

    if (!sale || sale.userId !== userId) {
      throw { status: 404, message: 'Venda não encontrada' };
    }

    return sale;
  }
}
