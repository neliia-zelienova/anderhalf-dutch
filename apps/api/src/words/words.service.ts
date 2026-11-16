import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@anderhalf/contracts/user';
import type { GlobalWordsQueryDto, UserWordsQueryDto } from './dto/user-words-query.dto.ts';
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

    async getGlobalWords(translationLanguage: Language, query: GlobalWordsQueryDto) {
        return await this.wordsRepository.getWords(translationLanguage, query);
    }

    async getUserWords(user: User, query: UserWordsQueryDto) {
        return await this.userWordsRepository.getUserWords(user.id, user.language, query);
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