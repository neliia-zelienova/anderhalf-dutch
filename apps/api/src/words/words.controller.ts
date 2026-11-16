import { Controller, Get, UseGuards, Post, Body, Delete, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { WordsService } from './words.service.ts';
import { GlobalWordsQueryDto, UserWordsQueryDto } from './dto/user-words-query.dto.ts';
import { SessionsGuard } from '../auth/sessions.guard.ts';
import { CurrentUser } from '../auth/current-user.decorator.ts';
import type { User } from '@anderhalf/contracts/user';
import { WordDto } from './dto/word.dto.ts';

@Controller('words')
@UseGuards(SessionsGuard)
export class WordsController {
    constructor(
        private readonly wordsService: WordsService,
    ) {}

    @Get('')
    async getGlobalWords(@CurrentUser() user: User, @Query() query: GlobalWordsQueryDto) {
        return await this.wordsService.getGlobalWords(user.language, query);
    }

    @Get('me')
    async getWords(@CurrentUser() user: User, @Query() query: UserWordsQueryDto) {
        return await this.wordsService.getUserWords(user, query);
    }

    @Post(':wordId')
    async addWordFromGlobalList(@CurrentUser() user: User, @Param('wordId', ParseUUIDPipe) wordId: string) {
        return await this.wordsService.addWordFromGlobalList(user.id, wordId);
    }

    @Delete(':wordId')
    async deleteWordFromUsersList(@CurrentUser() user: User, @Param('wordId', ParseUUIDPipe) wordId: string) {
        return await this.wordsService.deleteWordFromUsersList(user.id, wordId);
    }
} 