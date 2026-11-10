import { Language } from '@anderhalf/contracts/word';
import { UserRole } from '@anderhalf/contracts/user';

export class UserEntity {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    username: string;
    role: UserRole;
    language: Language;
}
