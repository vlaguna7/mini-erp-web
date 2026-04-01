import prisma from '../db/prismaClient';
import { Prisma } from '@prisma/client';

export class ProductBrandService {
  static async getByUser(userId: number) {
    return prisma.productBrand.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  static async create(userId: number, name: string) {
    try {
      return await prisma.productBrand.create({
        data: { userId, name },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Marca já existe');
      }
      throw error;
    }
  }

  static async delete(userId: number, id: number) {
    const item = await prisma.productBrand.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Marca não encontrada');
    await prisma.productBrand.delete({ where: { id } });
    return { message: 'Marca removida' };
  }
}
