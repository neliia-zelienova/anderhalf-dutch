import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@anderhalf/contracts/user';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto.ts';
import type { WordSortingQueryDto } from './dto/sort-query.dto.ts';
import { UserWordsRepository } from './user-words.repository.ts';
import { CardState } from '../common/words/types/card-state.ts';
import { FsrsService } from '../fsrs/fsrs.service.ts';
import { WordsRepository } from './words.repository.ts';
import type { Language } from '@anderhalf/contracts/word';

@Injectable()
export class WordsService {
    constructor(
        private readonly userWordsRepository: UserWordsRepository,
        private readonly wordsRepository: WordsRepository,
        private readonly fsrsService: FsrsService,
    ) {}

    async getGlobalWords(translationLanguage: Language, pagination: PaginationQueryDto, sortQuery: WordSortingQueryDto) {
        return await this.wordsRepository.getWords(translationLanguage, pagination, sortQuery);
    }

    async getUserWords(user: User, pagination: PaginationQueryDto, sortQuery: WordSortingQueryDto) {
        return await this.userWordsRepository.getUserWords(user.id, user.language, pagination, sortQuery);
    }

    async addWordFromGlobalList(userId: string, wordId: string) {
        const word = await this.wordsRepository.findGlobalWordById(wordId);
        if (!word) {
            throw new NotFoundException('Word not found');
        }
        const newCard: CardState = this.fsrsService.addCard(new Date());
        return await this.userWordsRepository.addWordFromList(userId, wordId, newCard);
    }

    async deleteWordFromUsersList(userId: string, wordId: string) {
        return await this.userWordsRepository.deleteWordFromList(userId, wordId);
    }
}