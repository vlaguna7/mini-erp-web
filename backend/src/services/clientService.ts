import prisma from '../db/prismaClient';

export class ClientService {
  static async createClient(
    userId: number,
    data: {
      name: string;
      personType?: string;
      cpfCnpj?: string;
      gender?: string;
      birthDate?: string;
      phone?: string;
      whatsapp?: string;
      instagram?: string;
      email?: string;
      category?: string;
      photo?: string;
    }
  ) {
    return await prisma.client.create({
      data: {
        userId,
        name: data.name,
        personType: data.personType || null,
        cpfCnpj: data.cpfCnpj || null,
        gender: data.gender || null,
        birthDate: data.birthDate || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        instagram: data.instagram || null,
        email: data.email || null,
        category: data.category || null,
        photo: data.photo || null,
      },
    });
  }

  static async getClientsByUser(userId: number, limit: number = 100, offset: number = 0) {
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.client.count({ where: { userId } }),
    ]);

    return { clients, total };
  }

  static async getClientById(userId: number, clientId: number) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  static async updateClient(
    userId: number,
    clientId: number,
    updates: {
      name?: string;
      personType?: string;
      cpfCnpj?: string;
      gender?: string;
      birthDate?: string;
      phone?: string;
      whatsapp?: string;
      instagram?: string;
      email?: string;
      category?: string;
      photo?: string;
    }
  ) {
    await this.getClientById(userId, clientId);

    return await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.personType !== undefined && { personType: updates.personType }),
        ...(updates.cpfCnpj !== undefined && { cpfCnpj: updates.cpfCnpj }),
        ...(updates.gender !== undefined && { gender: updates.gender }),
        ...(updates.birthDate !== undefined && { birthDate: updates.birthDate }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.whatsapp !== undefined && { whatsapp: updates.whatsapp }),
        ...(updates.instagram !== undefined && { instagram: updates.instagram }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.photo !== undefined && { photo: updates.photo }),
      },
    });
  }

  static async deleteClient(userId: number, clientId: number) {
    await this.getClientById(userId, clientId);
    await prisma.client.delete({ where: { id: clientId } });
    return { message: 'Client deleted successfully' };
  }
}
