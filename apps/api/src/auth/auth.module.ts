import { PrismaModule } from '../prisma/prisma.module.ts';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.ts';
import { SessionAuth } from './session-auth.provider.ts';
import { MagicLinkMailer } from './magic-link.mailer.ts';
import { MagicLinkController } from './magic-link.controller.ts';
import { PrismaAuthenticationStore } from './prisma-auth.ts';
import { AuthController } from './auth.controller.ts';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [MagicLinkController, AuthController],
  providers: [SessionAuth, MagicLinkMailer, PrismaAuthenticationStore],
})
export class AuthModule {}
