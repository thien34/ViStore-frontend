import { Paging, PagingResponse } from './Paging'

export interface Category {
    id?: number
    name: string
    parentCategoryId: number | null
    [key: string]: string | number | null | undefined
}

export interface CategoryNameResponse {
    id: number
    name: string
    children: CategoryNameResponse[]
}

export interface CategoryPagingResponse extends PagingResponse {
    data: Paging
}

export interface CategoryResponse extends Response {
    data: Category
}
