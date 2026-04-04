import prisma from '../db/prismaClient';

export class EmployeeService {
  static async getByUser(userId: number) {
    return prisma.employee.findMany({
      where: { userId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  static async create(userId: number, data: { name: string; email?: string; phone?: string; role?: string }) {
    return prisma.employee.create({
      data: {
        userId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role || null,
      },
    });
  }

  static async update(userId: number, id: number, data: { name?: string; email?: string; phone?: string; role?: string; active?: boolean }) {
    const item = await prisma.employee.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Vendedor não encontrado');
    return prisma.employee.update({
      where: { id },
      data,
    });
  }

  static async delete(userId: number, id: number) {
    const item = await prisma.employee.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Vendedor não encontrado');
    await prisma.employee.delete({ where: { id } });
    return { message: 'Vendedor removido' };
  }
}
