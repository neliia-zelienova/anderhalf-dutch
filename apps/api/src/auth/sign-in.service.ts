import { Injectable } from "@nestjs/common";
import { SessionsService } from "./sessions.service.ts";
import { UsersRepository } from "../users/users.repository.ts";
import { MagicLinkService } from "./magic-link.service.ts";

@Injectable()
export class SignInService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly sessionService: SessionsService,
        private readonly magicLinkService: MagicLinkService
    ) {
    }

    async signIn(email: string, emailVerified?: boolean) {
        let user = await this.usersRepository.findByEmail(email);
        if (!user) {
            // Create a new user if not found
            user = await this.usersRepository.create(email, { emailVerified });
        }
        return this.sessionService.create(user.id);
    }

    async logout(session: string) {
        await this.sessionService.delete(session);
    }

    async createMagicLink(email: string) {
        await this.magicLinkService.sendMagicLink(email);
    }

    async signInWithMagicLink(token: string) {
        const email = await this.magicLinkService.consumeMagicLink(token);
        return this.signIn(email, true);
    }
}