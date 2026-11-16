export enum Order {
    asc = 'asc',
    desc = 'desc',
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        lastPage: number;
        page: number;
        perPage: number;
        prev: number | null;
        next: number | null;
    };
}

export interface PaginateOptions {
    page?: number | string;
    perPage?: number | string;
    limit?: number;
    offset?: number;
}

export interface SortingOptions {
    order?: Order;
    sortBy?: string;
}