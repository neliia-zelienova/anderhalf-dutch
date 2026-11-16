import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service.ts';
import { parsePaginateOptions, generateMeta } from '../common/pagination/utils.ts';
import { Language } from "@anderhalf/contracts/word";
import { Order } from "@anderhalf/contracts/pagination";
import { Prisma } from "../generated/client.ts";
import { GlobalWordsQueryDto } from "./dto/user-words-query.dto.ts";
@Injectable()
export class WordsRepository {

    constructor(private readonly prismaService: PrismaService){}

    async getWords(translationLanguage: Language, query: GlobalWordsQueryDto) {
        const { page, perPage, skip } = parsePaginateOptions(query);
        const term = query.search?.trim();
        const where: Prisma.WordWhereInput = {
            ownerId: null,
            ...(term ? {
                title: {
                    contains: term,
                    mode: 'insensitive'
                }
            } : {})
        };
        const [words, count] = await this.prismaService.$transaction([
            this.prismaService.word.findMany({
                where,
                skip,
                take: perPage,
                orderBy: [
                    {
                        [query.sortBy ?? 'title']: query.order ?? Order.asc,
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