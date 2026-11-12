
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import { Prisma, MagicLink } from '../generated/client.ts';

@Injectable()
export class PrismaAuthenticationStore
{
  constructor(
    private readonly prismaService: PrismaService,
  ) {
  }
  async createSession(record: { userId: string, id: string, expiresAt: Date, lastActiveAt: Date }): Promise<void> {
    await this.prismaService.session.create({
        data: record,
    });
  }
  async findSession(id: string): Promise<{ userId: string, id: string, expiresAt: Date, lastActiveAt: Date } | null> {
    return this.prismaService.session.findUnique({
        where: { id },
    });
  }
  async updateSession(id: string, data: { expiresAt: Date, lastActiveAt: Date }): Promise<void> {
    await this.prismaService.session.update({
        where: { id },
        data,
    });
  }
  async findSessionsByUserId(userId: string): Promise<{ userId: string, id: string, expiresAt: Date, lastActiveAt: Date }[]> {
    return this.prismaService.session.findMany({
        where: { userId },
    });
  }
  async deleteSession(params: { where: { id: string } }): Promise<void> {
    await this.prismaService.session.delete(params);
  }
  // Magic links
  async saveMagicLink(record: { id: string, expiresAt: Date, email: string }): Promise<void> {
    await this.prismaService.magicLink.create({
        data: record,
    });
  }

  async consumeMagicLink(id: string): Promise<MagicLink | undefined> {
    try {
        const row = await this.prismaService.magicLink.delete({
            where: { id },
        })
        return row;
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return undefined;
        }
        throw e;
    }
  }
}