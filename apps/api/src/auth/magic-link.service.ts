import { Injectable, UnauthorizedException } from "@nestjs/common";
import { hashToken, generateToken } from './token.utils.ts';
import { MAGIC_LINK_TTL } from '../constants/auth.constants.ts';
import { ConfigService } from "@nestjs/config";
import { PrismaAuthenticationStore } from "./prisma-auth.ts";

@Injectable()
export class MagicLinkService {
    constructor(
        private readonly prismaAuth: PrismaAuthenticationStore,
        private readonly configService: ConfigService,
    ) {}

    async sendMagicLink(email: string): Promise<void> {
        const token = generateToken();
        const hash = hashToken(token);
        await this.prismaAuth.saveMagicLink({ 
            email,
            id: hash,
            expiresAt: new Date(Date.now() + MAGIC_LINK_TTL * 1000)
        });
        console.log(`${this.configService.get('APP_URL')}/sign-in/magic?token=${token}`);
    }

    async consumeMagicLink(token: string): Promise<string> {
        const hash = hashToken(token);
        const row = await this.prismaAuth.consumeMagicLink(hash);
        if (!row || row.expiresAt < new Date()) {
            throw new UnauthorizedException();
        }
        return row.email;
    }
}