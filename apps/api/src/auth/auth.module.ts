import { PrismaModule } from '../prisma/prisma.module.ts';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.ts';
import { SessionAuth } from './session-auth.provider.ts';
import { AuthRepository } from './auth-repository.ts';
import { AuthController } from './auth.controller.ts';
import { SignInService } from './sign-in.service.ts';
import { MagicLinkService } from './magic-link.service.ts';
import { MagicLinkController } from './magic-link.controller.ts';
import { SessionsService } from './sessions.service.ts';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AuthController, MagicLinkController],
  providers: [SessionAuth, AuthRepository, SignInService, MagicLinkService, SessionsService],
})
export class AuthModule {}
