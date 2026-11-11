
import type { User } from '@anderhalf/contracts/user';

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
    sessionExtra: { user: User };
  }
}