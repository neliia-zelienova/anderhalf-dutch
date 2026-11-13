import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@anderhalf/contracts/user';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
