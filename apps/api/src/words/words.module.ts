import { Module } from '@nestjs/common';
import { WordsService } from './words.service.ts';
import { WordsController } from './words.controller.ts';
import { AuthModule } from '../auth/auth.module.ts';
import { PrismaModule } from '../prisma/prisma.module.ts';
import { UserWordsRepository } from './user-words.repository.ts';
import { FsrsModule } from '../fsrs/fsrs.module.ts';
import { WordsRepository } from './words.repository.ts';

@Module({
    imports: [AuthModule, PrismaModule, FsrsModule],
    controllers: [WordsController],
    providers: [WordsService, UserWordsRepository, WordsRepository],
})
export class WordsModule {}