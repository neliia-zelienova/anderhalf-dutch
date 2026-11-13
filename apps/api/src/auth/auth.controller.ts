import {
  Controller,
  HttpCode,
  Post,
  Res,
  Get,
  UseGuards,
  Cookies,
} from '@nestjs/common';
import { SESSION_COOKIE_OPTIONS } from '../constants/auth.constants.ts';
import { SessionsGuard } from './sessions.guard.ts';
import { SignInService } from './sign-in.service.ts';
import { HttpAdapterHost } from '@nestjs/core';
import { CurrentUser } from './current-user.decorator.ts';
import type { User } from '@anderhalf/contracts/user';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly signInService: SignInService,
  ) {}

  @Get('me')
  @UseGuards(SessionsGuard)
  async getMe(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Cookies('session') session: string,
  ) {
    if (session) {
      await this.signInService.logout(session);
    }
    this.adapterHost.httpAdapter.clearCookie(
      res,
      'session',
      SESSION_COOKIE_OPTIONS,
    );
  }
}
