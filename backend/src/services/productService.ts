import prisma from '../db/prismaClient';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async createProduct(
    userId: number,
    name: string,
    code: string,
    category: string,
    quantityStock: number,
    priceCost: number,
    priceSale: number,
    supplierId?: number,
    minStock?: number
  ) {
    try {
      return await prisma.product.create({
        data: {
          userId,
          name,
          code,
          category,
          quantityStock,
          priceCost,
          priceSale,
          supplierId: supplierId || null,
          minStock: minStock || null,
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Product code already exists for this user');
      }
      throw error;
    }
  }

  static async getProductsByUser(userId: number, limit: number = 100, offset: number = 0) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where: { userId } }),
    ]);

    return { products, total };
  }

  static async getProductById(userId: number, productId: number) {
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  static async updateProduct(
    userId: number,
    productId: number,
    updates: {
      name?: string;
      code?: string;
      category?: string;
      quantityStock?: number;
      priceCost?: number;
      priceSale?: number;
      minStock?: number;
    }
  ) {
    await this.getProductById(userId, productId);

    try {
      return await prisma.product.update({
        where: { id: productId },
        data: {
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.code !== undefined && { code: updates.code }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.quantityStock !== undefined && { quantityStock: updates.quantityStock }),
          ...(updates.priceCost !== undefined && { priceCost: updates.priceCost }),
          ...(updates.priceSale !== undefined && { priceSale: updates.priceSale }),
          ...(updates.minStock !== undefined && { minStock: updates.minStock }),
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Product code already exists for this user');
      }
      throw error;
    }
  }

  static async deleteProduct(userId: number, productId: number) {
    await this.getProductById(userId, productId);

    await prisma.product.delete({ where: { id: productId } });

    return { message: 'Product deleted successfully' };
  }

  static async getLowStockProducts(userId: number) {
    const products = await prisma.product.findMany({
      where: {
        userId,
        minStock: { not: null },
      },
      orderBy: { quantityStock: 'asc' },
    });
    return products.filter(p => p.quantityStock <= (p.minStock ?? 0));
  }
}
