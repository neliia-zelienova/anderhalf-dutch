import { ConflictException, Injectable } from '@nestjs/common';
import type { WordSortingQueryDto } from './dto/sort-query.dto.ts';
import { PrismaService } from '../prisma/prisma.service.ts';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto.ts';
import { parsePaginateOptions, generateMeta } from '../common/pagination/utils.ts';
import { Prisma } from '../generated/client.ts';
import { CardState } from '../common/words/types/card-state.ts';
import { WordSortBy, type Language } from '@anderhalf/contracts/word';
import { Order } from '@anderhalf/contracts/pagination';

@Injectable()
export class UserWordsRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async getUserWords(userId: string, userLanguage: Language, pagination: PaginationQueryDto, sortQuery: WordSortingQueryDto) {
        const { page, perPage, skip } = parsePaginateOptions(pagination);
        const where = {
            userId,
        }; 
        const [words, count] = await this.prismaService.$transaction([
            this.prismaService.userWord.findMany({
                where,
                skip,
                take: perPage,
                orderBy: [{
                    word: {
                        [sortQuery.sortBy ?? 'title']: sortQuery.order ?? Order.asc,
                    },
                    },
                    {id: Order.asc}
                ],
                include: {
                    word: {
                        include: {
                            translations: {
                                where: {
                                    language: userLanguage,
                                }
                            },
                        }
                    },
                }
            }),
            this.prismaService.userWord.count({
                where,
            })
        ]);
        const meta = generateMeta(count, perPage, page);
        return { data: words, meta };
    }

    async addWordFromList(userId: string, wordId: string, wordCard: CardState) {
        try {
            const newUserWord = await this.prismaService.userWord.create({
                data: {
                    userId,
                    wordId,
                    ...wordCard,
                }
            });
            return newUserWord;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') { // Unique constraint failed
                throw new ConflictException('Word already added');
            }
            throw e;
        }
    }

    async deleteWordFromList(userId: string, wordId: string) {
        await this.prismaService.userWord.deleteMany({
            where: {
                wordId,
                userId,
            }
        })
    }
}