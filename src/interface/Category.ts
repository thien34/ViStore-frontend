import { Paging, PagingResponse } from './Paging'

export interface Category {
    id?: number
    name: string
    parentCategoryId: number
    [key: string]: string | number | undefined
}

export interface CategoryPagingResponse extends PagingResponse {
    data: Paging
}

export interface CategoryResponse extends Response {
    data: Category
}
