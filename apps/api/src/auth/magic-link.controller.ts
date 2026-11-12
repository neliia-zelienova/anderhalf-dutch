import type { Response } from 'express';
import { HttpAdapterHost } from '@nestjs/core';
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { EmailDto } from './dto/email.dto.ts';
import { SignInService } from './sign-in.service.ts';
import { SESSION_TTL, SESSION_COOKIE_OPTIONS } from '../constants/auth.constants.ts';

@Controller('auth/magic-link')
export class MagicLinkController {
  constructor(
    private readonly signInService: SignInService,
    private readonly adapterHost: HttpAdapterHost,
  ){}
    @Post()
    @HttpCode(202)
    async magicLinkLogin(@Body() body: EmailDto) {
      await this.signInService.createMagicLink(body.email);
    }

    @Post('consume')
    @HttpCode(200)
    async consumeMagicLink(@Body() body: { token: string }, @Res({ passthrough: true }) res: Response) {
      const { token } = body;
      const sessionToken = await this.signInService.signInWithMagicLink(token);
      this.adapterHost.httpAdapter.setCookie(res, 'session', sessionToken, { 
          ...SESSION_COOKIE_OPTIONS,
          maxAge: SESSION_TTL,
      });
    }
}
