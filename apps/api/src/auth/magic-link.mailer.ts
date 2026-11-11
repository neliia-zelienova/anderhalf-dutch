
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticationRegistry, MagicLinkHandler, type MagicLink } from '@nestjs/authentication';
import { Mailer, type Mailable } from '@nestjs/mail';
import { UsersRepository } from '../users/users.repository.ts';

@Injectable()
export class MagicLinkMail implements Mailable<MagicLink> {
  render({ url }: MagicLink) {
    return {
      subject: 'Your sign-in link',
      template: 'magic-link',
      context: { url },
    };
  }
}

@Injectable()
export class MagicLinkMailer extends MagicLinkHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('magicLink', this);
  }

  async send(link: MagicLink) {
    await this.mailer.send(MagicLinkMail, { to: link.email, data: link });
  }

  // Runs when the link is used, which proves the address. The account returned
  // carries its stored `email`, and signs in only if the link went to that address.
  async resolveUser(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      // Passwordless sign-up. Return null instead to refuse unknown addresses.
      return this.usersRepository.create(email, { emailVerified: true });
    }
    return user;
  }
}
