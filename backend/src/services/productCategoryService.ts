import prisma from '../db/prismaClient';
import { Prisma } from '@prisma/client';

export class ProductCategoryService {
  static async getByUser(userId: number) {
    return prisma.productCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  static async create(userId: number, name: string) {
    try {
      return await prisma.productCategory.create({
        data: { userId, name },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Categoria já existe');
      }
      throw error;
    }
  }

  static async delete(userId: number, id: number) {
    const item = await prisma.productCategory.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Categoria não encontrada');
    await prisma.productCategory.delete({ where: { id } });
    return { message: 'Categoria removida' };
  }
}
