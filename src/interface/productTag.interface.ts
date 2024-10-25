import { PagingRequest, PagingResponse } from './paging.interface'

export interface ProductTags {
    id: number
    name: string
    taggedProducts: number
}

export interface ProductTag {
    id?: number
    name: string
    productId?: number
}

export type ProductTagsPagingResponse = PagingResponse<ProductTags>

export interface ProductTagSearch extends PagingRequest {
    name?: string
}
