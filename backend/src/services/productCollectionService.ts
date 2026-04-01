import prisma from '../db/prismaClient';
import { Prisma } from '@prisma/client';

export class ProductCollectionService {
  static async getByUser(userId: number) {
    return prisma.productCollection.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  static async create(userId: number, name: string) {
    try {
      return await prisma.productCollection.create({
        data: { userId, name },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Coleção já existe');
      }
      throw error;
    }
  }

  static async delete(userId: number, id: number) {
    const item = await prisma.productCollection.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Coleção não encontrada');
    await prisma.productCollection.delete({ where: { id } });
    return { message: 'Coleção removida' };
  }
}
