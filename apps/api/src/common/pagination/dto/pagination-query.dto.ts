import { PaginateOptions } from '@anderhalf/contracts/pagination';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationQueryDto implements PaginateOptions {
  @IsNumber()
  @IsPositive()
  page?: number;

  @IsNumber()
  @IsPositive()
  @Min(10)
  @Max(100)
  perPage?: number;
    
  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Min(0)
  offset?: number;
}