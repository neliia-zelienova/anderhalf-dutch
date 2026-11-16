import { PaginateOptions } from '@anderhalf/contracts/pagination';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationQueryDto implements PaginateOptions {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  perPage?: number;
}