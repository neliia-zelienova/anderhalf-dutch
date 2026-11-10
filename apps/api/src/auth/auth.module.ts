import { PrismaModule } from '../prisma/prisma.module.js';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { SessionAuth } from './session-auth.provider.js';
import { MagicLinkMailer } from './magic-link.mailer.js';
import { MagicLinkController } from './magic-link.controller.js';
import { PrismaAuthenticationStore } from './prisma-auth.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [MagicLinkController, AuthController],
  providers: [SessionAuth, MagicLinkMailer, PrismaAuthenticationStore],
})
export class AuthModule {}
