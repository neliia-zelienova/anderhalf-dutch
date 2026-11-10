import type { UserRole } from '@anderhalf/contracts/user';
import type { Language } from '@anderhalf/contracts/word';

export interface User {
  id: string;
  email: string;
  /** Whether the owner proved the address to us, e.g. by using a magic link. */
  emailVerified: boolean;
  role: UserRole;
  language: Language;
}