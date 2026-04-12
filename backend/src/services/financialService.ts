import prisma from '../db/prismaClient';

export class FinancialService {
  // ─── Transações Financeiras ─────────────────────
  static async getTransactions(userId: number, filters?: { type?: string; date_from?: string; date_to?: string }) {
    const where: any = { userId };
    if (filters?.type) where.type = filters.type;
    if (filters?.date_from || filters?.date_to) {
      where.date = {};
      if (filters.date_from) where.date.gte = new Date(filters.date_from);
      if (filters.date_to) where.date.lte = new Date(filters.date_to);
    }
    return prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  static async createTransaction(userId: number, data: {
    type: string;
    category?: string;
    description: string;
    value: number;
    date: string;
    paymentMethod?: string;
    status?: string;
    notes?: string;
  }) {
    return prisma.financialTransaction.create({
      data: {
        userId,
        type: data.type,
        category: data.category || null,
        description: data.description,
        value: data.value,
        date: new Date(data.date),
        paymentMethod: data.paymentMethod || null,
        status: data.status || 'PAGO',
        notes: data.notes || null,
      },
    });
  }

  static async updateTransaction(userId: number, id: number, data: {
    category?: string;
    description?: string;
    value?: number;
    date?: string;
    paymentMethod?: string;
    status?: string;
    notes?: string;
  }) {
    const item = await prisma.financialTransaction.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Transação não encontrada');
    const updateData: any = {};
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    return prisma.financialTransaction.update({ where: { id }, data: updateData });
  }

  static async deleteTransaction(userId: number, id: number) {
    const item = await prisma.financialTransaction.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Transação não encontrada');
    await prisma.financialTransaction.delete({ where: { id } });
    return { message: 'Transação removida' };
  }

  // ─── Despesas Recorrentes ──────────────────────
  static async getRecurringExpenses(userId: number) {
    return prisma.recurringExpense.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createRecurringExpense(userId: number, data: {
    description: string;
    category?: string;
    value: number;
    frequency: string;
    dayOfMonth?: number;
    startDate: string;
    endDate?: string;
    notes?: string;
  }) {
    return prisma.recurringExpense.create({
      data: {
        userId,
        description: data.description,
        category: data.category || null,
        value: data.value,
        frequency: data.frequency,
        dayOfMonth: data.dayOfMonth || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes || null,
      },
    });
  }

  static async updateRecurringExpense(userId: number, id: number, data: {
    description?: string;
    category?: string;
    value?: number;
    frequency?: string;
    dayOfMonth?: number;
    startDate?: string;
    endDate?: string;
    active?: boolean;
    notes?: string;
  }) {
    const item = await prisma.recurringExpense.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Despesa recorrente não encontrada');
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth || null;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    return prisma.recurringExpense.update({ where: { id }, data: updateData });
  }

  static async deleteRecurringExpense(userId: number, id: number) {
    const item = await prisma.recurringExpense.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Despesa recorrente não encontrada');
    await prisma.recurringExpense.delete({ where: { id } });
    return { message: 'Despesa recorrente removida' };
  }
}
