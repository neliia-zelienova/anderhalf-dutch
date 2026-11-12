import { Injectable } from '@nestjs/common';
import { generateToken, hashToken } from './token.utils.ts';
import { SESSION_TTL } from '../constants/auth.constants.ts';
import { PrismaAuthenticationStore } from './prisma-auth.ts';

const SESSION_TOUCH_INTERVAL = 60 * 60 * 1000; // one hour in milliseconds

@Injectable()
export class SessionsService {
    constructor(private readonly prismaAuth: PrismaAuthenticationStore) {}
    async create(userId: string) {
        const token = generateToken();
        const hash = hashToken(token);
        await this.prismaAuth.createSession({
            userId,
            id: hash,
            expiresAt: new Date(Date.now() + 1000 * SESSION_TTL), // 1 day from now
            lastActiveAt: new Date()
        });
        return token;
    }

    async findValid(token: string): Promise<{ session: { userId: string, id: string, expiresAt: Date, lastActiveAt: Date }, extended: boolean } | null>  {
        const hash = hashToken(token);
        const session = await this.prismaAuth.findSession(hash);
        if (!session || session.expiresAt < new Date()) {
            return null;
        }
        if (new Date().getTime() - session.lastActiveAt.getTime() < SESSION_TOUCH_INTERVAL) {
            return { session, extended: false };
        }
        await this.prismaAuth.updateSession(hash,
            {
                expiresAt: new Date(Date.now() + 1000 * SESSION_TTL), // extend session expiration
                lastActiveAt: new Date()
            }
        );
        return { session, extended: true};
    }

    async findByUserId(userId: string) {
        return this.prismaAuth.findSessionsByUserId(userId);
    }

    async delete(token: string) {
        const hash = hashToken(token);
        await this.prismaAuth.deleteSession({
            where: {
                id: hash
            }
        });
    }
}