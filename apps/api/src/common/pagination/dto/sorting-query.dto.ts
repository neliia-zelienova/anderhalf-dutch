import { Order, SortingOptions } from '@anderhalf/contracts/pagination';
import { IsEnum, IsOptional } from 'class-validator';

export class SortingQueryDto implements SortingOptions {
    @IsEnum(Order)
    @IsOptional()
    order?: Order;
}