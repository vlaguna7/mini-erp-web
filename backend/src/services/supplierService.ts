import prisma from '../db/prismaClient';

export class SupplierService {
  static async getByUser(userId: number) {
    return prisma.supplier.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  static async create(userId: number, data: { name: string; cnpj?: string; email?: string; phone?: string }) {
    return prisma.supplier.create({
      data: {
        userId,
        name: data.name,
        cnpj: data.cnpj || null,
        email: data.email || null,
        phone: data.phone || null,
      },
    });
  }

  static async delete(userId: number, id: number) {
    const item = await prisma.supplier.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Fornecedor não encontrado');
    await prisma.supplier.delete({ where: { id } });
    return { message: 'Fornecedor removido' };
  }
}
