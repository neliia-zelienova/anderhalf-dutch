
import { Injectable } from '@nestjs/common';
import {
  AuthenticationStorage,
  type MagicLinkRecord,
  type MagicLinkStore,
  type RefreshTokenRecord,
  type RefreshTokenStore,
  type SessionRecord,
  type SessionStore,
} from '@nestjs/authentication';
import { PrismaService } from '../prisma/prisma.service.ts';
import { Prisma } from '../generated/client.ts';

/**
 * Keeps sessions, refresh tokens, authenticators and pending links in
 * PostgreSQL, through Prisma. Every method that decides whether something
 * works once is a single conditional statement, so the guarantees hold with
 * any number of API instances.
 */
@Injectable()
export class PrismaAuthenticationStore
  implements SessionStore, RefreshTokenStore, MagicLinkStore
{
  /** Pending links and logins kept per table: anyone can create them. */
  protected readonly maxPending: number = 100_000;

  constructor(
    private readonly prismaService: PrismaService,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({
      sessions: this,
      refreshTokens: this,
      magicLinks: this,
    });
  }

  // Sessions

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.prismaService.session.findUnique({ where: { id } });
    return row ? withoutNulls(row) as SessionRecord : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.prismaService.session.create({ data: {...record, metadata: record.metadata as Prisma.InputJsonObject, ...(record.mfa ? {mfa: record.mfa} : {}) } });
    await this.prismaService.session.deleteMany({ where: { expiresAt: { lte: record.createdAt } } });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    // Conditional: a session deleted by a sign-out stays deleted.
    await this.prismaService.session.updateMany({
      where: { id, lastActiveAt: { lt: lastActiveAt } },
      data: { lastActiveAt },
    });
  }

  // Whether this call deleted it: of two rotations of a session, or a rotation and a sign-out, one wins.
  async deleteSession(id: string): Promise<boolean> {
    const { count } = await this.prismaService.session.deleteMany(
        {
          where: { id }
        }
    )
    return count > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.prismaService.session.findMany({
        where: {
            userId: userId
        }
    })
    return rows.map(row => withoutNulls(row) as SessionRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prismaService.session.deleteMany({ where: { userId } });
  }

  // Refresh tokens

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const [row] = await this.prismaService.refreshToken.findMany({
        where: { id }
    })
    if (!row) {
      return undefined;
    }
    const { revoked: _, ...token } = row;
    return withoutNulls(token) as RefreshTokenRecord;
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.prismaService.refreshToken.create({
        data: {...record, claims: record.claims as Prisma.InputJsonObject},
    })
    await this.prismaService.refreshToken.deleteMany({
        where: { familyExpiresAt: { lte: record.createdAt } }
    })
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    // Conditional: of two refreshes with the same token, one updates the row.
    const { count } = await this.prismaService.refreshToken.updateMany({
        where: {
            id,
            usedAt: null,
        },
        data: {
            usedAt: at,
        }
    })
    return count === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
        where: { familyId },
        data: { revoked: true }
    });
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const revoked = await this.prismaService.refreshToken.findFirst({
        where: { familyId, revoked: true }
    })
    return !!revoked;
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true }
    });
  }

  // Magic links
  async saveMagicLink(record: MagicLinkRecord): Promise<void> {
    await this.prismaService.magicLink.create({
        data: record,
    });
    await this.trim(record.createdAt);
  }

  async consumeMagicLink(id: string): Promise<MagicLinkRecord | undefined> {
    // DELETE … RETURNING: of two requests with the same link, one gets the row.
    try {
        const row = await this.prismaService.magicLink.delete({
            where: { id },
        })
        return withoutNulls(row);
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && (e as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
            return undefined;
        }
        throw e;
    }
  }

  /** Deletes what expired, and past `maxPending`, what expires first. */
  private async trim(now: Date) {
    await this.prismaService.magicLink.deleteMany({
        where: { expiresAt: { lte: now } }
    })
    const [cutoff] = await this.prismaService.magicLink.findMany({
        orderBy: { expiresAt: 'desc' },
        take: 1,
        skip: this.maxPending,
    });
    if (cutoff) {
      await this.prismaService.magicLink.deleteMany({
          where: { expiresAt: { lte: cutoff.expiresAt } }
      });
    }
  }
}

/** A row without its NULL columns: the package's records leave optional fields out. */
type WithoutNulls<T> = { [K in keyof T as null extends T[K] ? never : K]: T[K] } & {
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

function withoutNulls<T extends object>(row: T): WithoutNulls<T> {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)) as WithoutNulls<T>;
}
