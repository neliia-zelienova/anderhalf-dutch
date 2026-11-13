import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.ts';
import { UsersRepository } from '../users/users.repository.ts';
import { HttpAdapterHost } from '@nestjs/core';
import {
  SESSION_COOKIE_OPTIONS,
  SESSION_TTL,
} from '../constants/auth.constants.ts';

@Injectable()
export class SessionsGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionsService,
    private readonly userRepository: UsersRepository,
    private readonly adapterHost: HttpAdapterHost,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionToken = request.cookies?.['session'];
    if (!sessionToken) {
      throw new UnauthorizedException();
    }
    const validSession = await this.sessionService.findValid(sessionToken);
    if (!validSession) {
      throw new UnauthorizedException();
    }
    const user = await this.userRepository.findById(
      validSession.session.userId,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    request.user = user;
    if (validSession.extended) {
      const response = context.switchToHttp().getResponse();
      this.adapterHost.httpAdapter.setCookie(
        response,
        'session',
        sessionToken,
        {
          ...SESSION_COOKIE_OPTIONS,
          maxAge: SESSION_TTL,
        },
      );
    }
    return true;
  }
}
