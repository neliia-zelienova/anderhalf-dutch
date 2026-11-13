import { Injectable } from '@nestjs/common';
import { generateToken, hashToken } from './token.utils.ts';
import { SESSION_TTL } from '../constants/auth.constants.ts';
import { AuthRepository } from './auth-repository.ts';
import { SESSION_TOUCH_INTERVAL } from '../constants/auth.constants.ts';
@Injectable()
export class SessionsService {
    constructor(private readonly authRepository: AuthRepository) {}
    async create(userId: string) {
        const token = generateToken();
        const hash = hashToken(token);
        await this.authRepository.createSession({
            userId,
            id: hash,
            expiresAt: new Date(Date.now() + 1000 * SESSION_TTL),
            lastActiveAt: new Date()
        });
        return token;
    }

    async findValid(token: string): Promise<{ session: { userId: string, id: string, expiresAt: Date, lastActiveAt: Date }, extended: boolean } | null>  {
        const hash = hashToken(token);
        const session = await this.authRepository.findSession(hash);
        if (!session || session.expiresAt < new Date()) {
            return null;
        }
        if (new Date().getTime() - session.lastActiveAt.getTime() < SESSION_TOUCH_INTERVAL) {
            return { session, extended: false };
        }
        await this.authRepository.updateSession(hash,
            {
                expiresAt: new Date(Date.now() + 1000 * SESSION_TTL), // extend session expiration
                lastActiveAt: new Date()
            }
        );
        return { session, extended: true};
    }

    async delete(token: string) {
        const hash = hashToken(token);
        await this.authRepository.deleteSession(hash);
    }
}