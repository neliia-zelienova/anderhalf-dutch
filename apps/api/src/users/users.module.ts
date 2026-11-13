import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository.ts';
import { PrismaModule } from '../prisma/prisma.module.ts';

@Module({
  imports: [PrismaModule],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
