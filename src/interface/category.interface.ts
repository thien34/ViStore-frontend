import { PagingRequest, PagingResponse } from './paging.interface'

export interface Category {
    id?: number
    name: string
    categoryParentId: number | null
}

export interface CategoryName {
    id: number
    name: string
    children: CategoryName[] | null
}

export type CategoryPagingResponse = PagingResponse<Category>

export interface CategorySearch extends PagingRequest {
    name?: string
}
