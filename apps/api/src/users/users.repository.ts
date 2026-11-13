import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import { User as UserRow } from '../generated/client.ts';
import { Language } from '@anderhalf/contracts/word';
import { User, UserRole } from '@anderhalf/contracts/user';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    email: string,
    { emailVerified = false }: { emailVerified?: boolean } = {},
  ): Promise<User> {
    const user = await this.prismaService.user.create({
      data: {
        email: normalize(email),
        emailVerified,
        role: 'user',
        language: 'en',
      },
    });
    return toUser(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    return user ? toUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email: normalize(email) },
    });
    return user ? toUser(user) : null;
  }

  /** Only if `email` is still the user's address: a link sent to an old one verifies nothing. */
  async markEmailVerified(id: string, email: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user || user.email !== normalize(email)) {
      return false;
    }
    await this.prismaService.user.update({
      where: { id },
      data: { emailVerified: true },
    });
    return true;
  }
}

// As the package passes addresses to handlers: an accent typed as two code points matches the stored one.
const normalize = (email: string) =>
  email.trim().normalize('NFC').toLowerCase();
const toUser = ({
  id,
  email,
  emailVerified,
  role,
  language,
}: UserRow): User => ({
  id,
  email,
  emailVerified,
  role: role as UserRole,
  language: language as Language,
});
