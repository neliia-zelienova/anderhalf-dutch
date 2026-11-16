import { WordsService } from './words.service.ts';
import { WordsRepository } from './words.repository.ts';
import { UserWordsRepository } from './user-words.repository.ts';
import { Test } from '@nestjs/testing';
import { FsrsService } from '../fsrs/fsrs.service.ts';
import { NotFoundException, ConflictException } from '@nestjs/common';

const fakeGlobalWordsRepository = {
  getWords: vi.fn(),
  findGlobalWordById: vi.fn(),
};

const fakeUserWordsRepository = {
    getUserWords: vi.fn(),
    addWordFromList: vi.fn(),
    deleteWordFromList: vi.fn(),
};

const fakeFsrsService = {
    addCard: vi.fn(),
};

describe('WordsService', () => {
    let wordsService: WordsService;

    beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
        WordsService,
        { provide: WordsRepository, useValue: fakeGlobalWordsRepository },
        { provide: UserWordsRepository, useValue: fakeUserWordsRepository },
        { provide: FsrsService, useValue: fakeFsrsService },
        ],
    }).compile();

    wordsService = moduleRef.get(WordsService);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('addWordFromGlobalList', () => {
        it('throws exception when word id is not found', async () => {
            const wordId = 'not-existing-word-id';
            const userId = 'test-user-id';
            fakeGlobalWordsRepository.findGlobalWordById.mockResolvedValue(null);
            await expect(wordsService.addWordFromGlobalList(userId, wordId)).rejects.toThrow(NotFoundException);
            expect(fakeFsrsService.addCard).not.toHaveBeenCalled();
            expect(fakeUserWordsRepository.addWordFromList).not.toHaveBeenCalled();
        });

        it('adds word from global list', async () => {
            const wordId = 'existing-word-id';
            const userId = 'test-user-id';
            const reps = 42;
            const date = '2024-06-18T00:00:00.000Z';
            vi.useFakeTimers({ now: new Date(date) });
            const wordCard = {
                stabilityFast: 0,
                stability: 0,
                difficulty: 0,
                dueAt: new Date(date),
                lastReviewAt: new Date(date),
                reps,
                lapses: 0,
                scheduledDays: 0,
                learningStep: 0,
            }
            fakeGlobalWordsRepository.findGlobalWordById.mockResolvedValue({ 
                id: wordId,
            });
            fakeFsrsService.addCard.mockReturnValue(wordCard);
            fakeUserWordsRepository.addWordFromList.mockResolvedValue({
                userId,
                wordId,
                ...wordCard,
            });
            const userWord = await wordsService.addWordFromGlobalList(userId, wordId);
            expect(fakeUserWordsRepository.addWordFromList).toHaveBeenCalledWith(userId, wordId, wordCard);
            expect(userWord).toEqual({ userId, wordId, ...wordCard });
            expect(fakeFsrsService.addCard).toHaveBeenCalledWith(new Date(date));
        });

        it('doesn\'t add word if it already exists', async () => {
            const wordId = 'existing-word-id';
            const userId = 'test-user-id';
            fakeGlobalWordsRepository.findGlobalWordById.mockResolvedValue({ id: wordId });
            fakeUserWordsRepository.addWordFromList.mockRejectedValue(new ConflictException());
            await expect(wordsService.addWordFromGlobalList(userId, wordId)).rejects.toThrow(ConflictException);
        });

    })
});