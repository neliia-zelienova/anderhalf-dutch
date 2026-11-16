import { Controller, Get, UseGuards, Post, Body, Delete, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { WordsService } from './words.service.ts';
import { SessionsGuard } from '../auth/sessions.guard.ts';
import { CurrentUser } from '../auth/current-user.decorator.ts';
import type { User } from '@anderhalf/contracts/user';
import { WordDto } from './dto/word.dto.ts';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto.ts';
import { WordSortingQueryDto } from './dto/sort-query.dto.ts';

@Controller('words')
@UseGuards(SessionsGuard)
export class WordsController {
    constructor(
        private readonly wordsService: WordsService,
    ) {}

    @Get('')
    async getGlobalWords(@CurrentUser() user: User, @Query() paginationQuery: PaginationQueryDto, @Query() sortQuery: WordSortingQueryDto) {
        return await this.wordsService.getGlobalWords(user.language, paginationQuery, sortQuery);
    }

    @Get('me')
    async getWords(@CurrentUser() user: User, @Query() paginationQuery: PaginationQueryDto, @Query() sortQuery: WordSortingQueryDto) {
        return await this.wordsService.getUserWords(user, paginationQuery, sortQuery);
    }

    @Post()
    async addWordFromGlobalList(@CurrentUser() user: User, @Body() body: WordDto) {
        return await this.wordsService.addWordFromGlobalList(user.id, body.wordId);
    }

    @Delete(':wordId')
    async deleteWordFromUsersList(@CurrentUser() user: User, @Param('wordId', ParseUUIDPipe) wordId: string) {
        return await this.wordsService.deleteWordFromUsersList(user.id, wordId);
    }
} 