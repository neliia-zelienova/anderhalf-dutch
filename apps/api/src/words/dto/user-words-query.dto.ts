import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { WordStatus } from "@anderhalf/contracts/word";
import { IntersectionType } from "@nestjs/mapped-types";
import { PaginationQueryDto } from "../../common/pagination/dto/pagination-query.dto.ts";
import { WordSortingQueryDto } from "./sort-query.dto.ts";

export class GlobalWordsFilterDto {
    @IsString()
    @MaxLength(50)
    @IsOptional()
    search?: string;
}

export class UserWordsFilterDto extends GlobalWordsFilterDto {
    @IsEnum(WordStatus)
    @IsOptional()
    status?: WordStatus;

    // Date with User's time zone considered
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    addedFrom?: Date;

    // Date with User's time zone considered
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    addedTo?: Date;
}

export class GlobalWordsQueryDto extends IntersectionType(GlobalWordsFilterDto, PaginationQueryDto, WordSortingQueryDto) {}
export class UserWordsQueryDto extends IntersectionType(UserWordsFilterDto, PaginationQueryDto, WordSortingQueryDto) {}