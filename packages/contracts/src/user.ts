import { Language } from "./word.js";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  /** Whether the owner proved the address to us, e.g. by using a magic link. */
  emailVerified: boolean;
  role: UserRole;
  language: Language;
}