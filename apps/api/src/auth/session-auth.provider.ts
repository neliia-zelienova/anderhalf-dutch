
import { Injectable } from '@nestjs/common';
import type { User } from '@anderhalf/contracts/user';
import { UsersRepository } from '../users/users.repository.ts';

@Injectable()
export class SessionAuth 
// extends SessionCookieProvider<User> 
{
  // constructor(
  //   private readonly usersRepository: UsersRepository,
  // ) {
  //   super();
  //   // Adds this provider to the chain the guard runs for every request.
  //   registry.registerProvider(this);
  // }

  // // Called for every request with a live session cookie.
  // // Returning null (the user was deleted) ends the session.
  // validate(session: SessionRecord) {
  //   return this.usersRepository.findById(session.userId);
  // }
}
