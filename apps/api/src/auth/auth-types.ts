
import type { User } from '../users/users.ts';

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
    sessionExtra: { user: User };
  }
}