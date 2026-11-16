import type { PaginateOptions } from '@anderhalf/contracts/pagination';
import { SortBy, SortOrder } from './types';

export const parsePaginateOptions = (
    options: PaginateOptions,
    defaultOptions: PaginateOptions = { page: 1, perPage: 10},
) => {
    const page = Number(options?.page || defaultOptions?.page) || 1;
    const perPage = Number(options?.perPage || defaultOptions?.perPage) || 10;
    const skip = page > 0 ? perPage * (page - 1) : 0;
    
    return { page, perPage, skip };
};

export const buildOrderBy = (sortBy?: SortBy, sortOrder?: SortOrder) => {
    if (!sortBy) return undefined;
    return { [sortBy]: sortOrder || 'asc' };
};

export const generateMeta = (total: number, perPage: number, page: number) => {
    const lastPage = Math.ceil(total / perPage);
    return {
        total,
        lastPage,
        page: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
    };
};