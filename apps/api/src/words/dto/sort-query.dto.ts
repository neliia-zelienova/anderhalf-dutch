import { IsEnum, IsOptional } from 'class-validator';
import { SortingQueryDto } from '../../common/pagination/dto/sorting-query.dto.ts';
import { WordSortBy } from '@anderhalf/contracts/word';

export class WordSortingQueryDto extends SortingQueryDto {
    @IsEnum(WordSortBy)
    @IsOptional()
    sortBy?: WordSortBy;
} 