import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service.ts';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto.ts';
import { parsePaginateOptions, generateMeta } from '../common/pagination/utils.ts';
import { Language, WordSortBy } from "@anderhalf/contracts/word";
import { WordSortingQueryDto } from "./dto/sort-query.dto.ts";
import { Order } from "@anderhalf/contracts/pagination";

@Injectable()
export class WordsRepository {

    constructor(private readonly prismaService: PrismaService){}

    async getWords(translationLanguage: Language, pagination: PaginationQueryDto, sortQuery: WordSortingQueryDto) {
        const { page, perPage, skip } = parsePaginateOptions(pagination);
        const where = {
            ownerId: null,
        };
        const [words, count] = await this.prismaService.$transaction([
            this.prismaService.word.findMany({
                where,
                skip,
                take: perPage,
                orderBy: [
                    {
                        [sortQuery.sortBy ?? 'title']: sortQuery.order ?? Order.asc,
                    },
                    {
                        id: Order.asc
                    }
                ],
                include: {
                    translations: {
                        where: {
                            language: translationLanguage,
                        }
                    },
                }
            }),
            this.prismaService.word.count({
                where,
            })
        ])
        const meta = generateMeta(count, perPage, page);
        return { data: words, meta };
    }


    async findGlobalWordById(wordId: string) {
        return await this.prismaService.word.findFirst({
            where: {
                id: wordId,
                ownerId: null,
            }
        });
    }
}