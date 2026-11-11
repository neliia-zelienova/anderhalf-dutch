import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { AuthenticationModule } from '@nestjs/authentication';
import { UsersModule } from './users/users.module.ts';
import { AuthModule } from './auth/auth.module.ts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileTemplateEngine, LogMailTransport, MailModule, SmtpTransport } from '@nestjs/mail';
import { ThrottlerGuard, ThrottlerModule, minutes, normalizeIp } from '@nestjs/throttler';
import { accountEmail } from './auth/account-email.ts';
import { join } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      // Per IP address, on every route: 100 requests a minute.
      { name: 'default', ttl: minutes(1), limit: 100 },
      // Per email and IP address, wherever the request body names an account.
      {
        name: 'account',
        ttl: minutes(15),
        limit: 5,
        skipIf: (context) => !accountEmail(context.switchToHttp().getRequest()),
        getTracker: (req) => `${accountEmail(req)}|${normalizeIp(req.ip)}`,
      },
    ]),
     MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // In development, each email (links included) is printed to the log.
        transport: configService.get('SMTP_URL') ? new SmtpTransport({ url: configService.get('SMTP_URL') }) : new LogMailTransport(),
        // The emails' HTML: the templates in mail/templates, next to this file
        templates: new FileTemplateEngine({ dir: join(import.meta.dirname, 'mail/templates') }),
        from: 'Accounts <accounts@anderhalf.com>',
      }),
    }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        session: {
          absoluteTtl: '14d', // signed out after 14 days, however active
          idleTtl: '3d', // or after 3 days without a request
        },
        magicLink: { url: `${configService.get('APP_URL') ?? ''}/sign-in/magic` },
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard },],
})
export class AppModule {}
